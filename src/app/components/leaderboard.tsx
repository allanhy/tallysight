/* eslint-disable prefer-const */
"use client";

import React, { useState, useEffect } from 'react';
import LeaderboardProfiles from '../components/leaderboardProfiles';

type Sport = 'NFL' | 'MLB' | 'NBA' | 'SELECT';

type LeaderboardEntry = {
    user_id: number;
    username: string;
    points: number;
};

const Leaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentWeek, setCurrentWeek] = useState<number | null>(null);
    const [selectedSport, setSelectedSport] = useState<Sport>("NBA"); // Default to nba can be changed if needed
    const [selectedWeek, setSelectedWeek] = useState<number | null>(0); // Defaults to all time
    const [isInitialRender] = useState(true);

    // Updating Weekly Items
    useEffect(() => {
        // Set the current week when the component mounts
        const week = getCurrentWeek();
        setCurrentWeek(week);
        checkAndCreateLeaderboard();
    }, []);

    // Getting selected leaderboard for chosen week and sport
    useEffect(() => {
        
            // Initial fetch proceed without early return
            if (!isInitialRender && (selectedSport === 'SELECT' || selectedWeek === null || selectedWeek === -1 || selectedWeek === 0)) {
                setLeaderboard([]);
                setLoading(false);
                return;
            }
            const fetchLeaderboard = async () => {
            

            setLoading(true);
            setError('');

            try {
                // Log the fetch for debugging
                console.log(`Fetching leaderboard: sport=${selectedSport}, week=${selectedWeek}`);

                const res = await fetch(
                    `/api/leaderboard-entries/getEntriesForLeaderboard?sport=${selectedSport}&week=${selectedWeek}`
                );
                const data = await res.json();

                console.log("API response:", data);

                if (res.ok) {
                    setLeaderboard(data.data);
                } else {
                    setError(data.message || "Failed to load leaderboard");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError(`Network error fetching leaderboard: ${error}`);
            } finally {
                setLoading(false);
            }
        };

        // Force a fetch on initial render
        fetchLeaderboard();
    }, [selectedSport, selectedWeek, isInitialRender]);

    // recovery mechanism if loading gets stuck
    useEffect(() => {
        // If loading is true for more than 5 seconds, force it to false
        let loadingTimer: NodeJS.Timeout;
        
        if (loading) {
            loadingTimer = setTimeout(() => {
                console.log("Loading timeout - forcing loading state to false");
                setLoading(false);
                
                // Try to fetch again if we're on the initial NBA All Time selection
                if (selectedSport === 'NBA' && selectedWeek === 0) {
                    console.log("Retrying NBA All Time fetch");
                    // Force a re-fetch by toggling and restoring the selection
                    setSelectedWeek(-1);
                    setTimeout(() => {
                        setSelectedWeek(0);
                    }, 100);
                }
            }, 5000);
        }
        
        return () => {
            if (loadingTimer) clearTimeout(loadingTimer);
        };
    }, [loading, selectedSport, selectedWeek]);

    // Function to get the current week of the year
    const getCurrentWeek = () => {
        const date: Date = new Date();
        const startDate: Date = new Date(date.getFullYear(), 0, 1);
        const days: number = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

    // Creating a new leaderboard for current week if there isn't one already
    const checkAndCreateLeaderboard = async () => {
        try {
            const res = await fetch('/api/leaderboard/newLeaderboard/', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                setError(`Error creating weekly leaderboard: ${data.message}`);
            }
        } catch (error) {
            setError(`Network error creating leaderboard: ${error}`);
        }
    };

    // Generate weeks dynamically starting from current week
    const generateWeeks = () => {
        if (currentWeek === null)
            return []; // Or return a default value

        const weeks = [];
        const weeksToDisplay = 52;

        for (let i = currentWeek; i > currentWeek - weeksToDisplay; i--) {
            if (i > 0) {
                const weekLabel = (i === currentWeek) ? `Week ${i} (Current)` : `Week ${i}`;
                weeks.push(weekLabel);
            }
        }
        return weeks;
    };

    const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSport(e.target.value as Sport);
    }

    const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWeek(parseInt(e.target.value, 10));
    }

    return (
        <div className='leaderboard-page'>
            <div className='content-wrapper'>
                <div className='main-content'>
                    <h1 className='leaderboard-title text-black dark:text-white'>
                    {selectedSport === "SELECT" || selectedWeek === -1 || selectedWeek === 0? "Overall Leaderboard" : `${selectedSport} Week ${selectedWeek} Leaderboard`}
                    </h1>
                    <div className='leaderboard-container text-black bg-gradient-to-r from-white to-gray-100 dark:text-white dark:from-gray-900 dark:to-gray-950'>
                        <div className='leaderboard-controls'>
                            <select
                                className='select text-black bg-gray-300/90 dark:text-white dark:bg-gray-800'
                                value={selectedSport}
                                onChange={handleSportChange}>
                                <option value='SELECT' disabled>Select Sport</option>
                                <option value="NBA">NBA</option>
                                <option value="NFL">NFL</option>
                                <option value="MLB">MLB</option>
                                <option value="NHL">NHL</option>

                                <optgroup label="Soccer" className='pt-2 pb-2 font-bold text-black bg-gray-300/90 dark:text-white dark:bg-gray-800/10'>
                                    <option value="MLS">MLS</option>
                                    <option value="EPL">English Premier League</option>
                                    <option value="LALIGA">La Liga</option>
                                    <option value="BUNDESLIGA">Bundesliga</option>
                                    <option value="SERIE_A">Serie A</option>
                                    <option value="LIGUE_1">Ligue 1</option>
                                </optgroup>
                            </select>

                            <select 
                                className='select text-black bg-gray-300/90 dark:text-white dark:bg-gray-800' 
                                value={selectedWeek ?? 0}
                                onChange={handleWeekChange}>
                                <option value='-1' disabled>Select Week</option>
                                <option value='0'>All Time</option>
                                {generateWeeks().map((week, index) => (
                                    <option key={index} value={currentWeek ? currentWeek - index : index + 1}>{week}</option>))}
                            </select>
                        </div>

                        {loading ? (
                                <p>Loading leaderboard...</p>
                            ) : error ? (
                                <p className='error'>{error}</p>
                            ) : (
                                <div className='leaderboard-table'>
                                    <div className='leaderboard-header'>
                                        <div className='rank text-black dark:text-white'>Rank</div>
                                        <div className='username text-black dark:text-white'>User</div>
                                        <div className='performance text-black dark:text-white'>Performance</div>
                                        <div className='points text-black dark:text-white'>Points</div>
                                    </div>
                                        {leaderboard.length <= 0 ? (
                                                <div>No rankings available for the selected sport and week. Please choose a different option.</div>
                                        ) : (
                                            <div className='hover:cursor-pointer'><LeaderboardProfiles sport={ selectedSport } week={ selectedWeek } userIds={leaderboard.map(entry => entry.user_id)}/></div>
                                        )}
                                </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .leaderboard-page {
                    min-height: 100vh;
                    display: flex;
                    flex-wrap: no-wrap;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .content-wrapper {
                    display: flex;
                    gap: 24px;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    max-width: 1200px;
                }

                .main-content {
                    max-width: 1000px;
                    width: 100%;
                }

                .leaderboard-title {
                    letter-spacing: 1.5px;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 600;
                    font-size: 65px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                /* For small screens (e.g., mobile devices) */
                @media (max-width: 480px) {
                    .leaderboard-title {
                        font-size: 50px;
                    }
                }
                 
                .leaderboard-container {
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 90vw;
                    width: 100%;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1.2rem;
                }

                .leaderboard-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .select {
                    padding: 8px;
                    border-radius: 5px;
                    width: 48%;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }

                .leaderboard-header {
                    display: flex;
                    justify-content: space-between;
                    background-color: rgba(255, 255, 255, 0.1);
                    text-transform: uppercase;
                    font-size: 1.3vh;
                    font-weight: 600;
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    min-width: 100%;
                    box-sizing: border-box;
                }

                .rank, .username, .performance, .points {
                    padding: 10px;
                    font-weight: bold;
                    min-width: 80px; /* Prevent wrapping */
                }

                .rank {
                    width: 15%;
                    text-align: left;
                }

                .username {
                    width: 35%;
                    text-align: left;
                }

                .performance {
                    width: 25%;
                    text-align: right;
                }

                .points {
                    width: 15%;
                    text-align: right;
                    padding-right: 3vh;
                }

                .leaderboard-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    min-width: 100%;
                    box-sizing: border-box;
                }

                .leaderboard-row div {
                    padding: 5px;
                    text-align: center;
                    min-width: 80px; /* Prevent wrapping in rows */
                }

                @media (max-width: 600px) {
                    .leaderboard-header {
                        flex-direction: row;
                        text-align: left;
                        align-items: flex-start;
                    }

                    .rank, .username, .performance, .points {
                        width: 100%;
                        text-align: left;
                        padding: 8px;
                        font-size: .5rem; /* Slightly smaller for mobile */
                    }

                    .leaderboard-row {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .rank{
                        text-align: left;
                    }

                    .points {
                        text-align: right;
                    }

                    .username {
                        text-align: left;
                    }

                    .performance {
                        text-align: right;
                    }
                }
            `}</style>
        </div>
    );
};

export default Leaderboard;