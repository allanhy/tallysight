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
            if (!isInitialRender && (selectedSport === 'SELECT' || selectedWeek === null || selectedWeek === -1)) {
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
                    <h1 className='leaderboard-title'>Leaderboard</h1>
                    <div className='leaderboard-container'>
                        <div className='leaderboard-controls'>
                            <select 
                                className='select'
                                value={selectedSport}
                                onChange={handleSportChange}>
                                <option value='NFL' disabled>NFL</option>
                                <option value='MLB' disabled>MLB</option>
                                <option value='NBA'>NBA</option>
                            </select>

                            <select 
                                className='select' 
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
                                        <div className='rank'>Rank</div>
                                        <div className='username'>User</div>
                                        <div className='performance'>Performance</div>
                                        <div className='points'>Points</div>
                                    </div>
                                        {leaderboard.length <= 0 ? (
                                                <div>No rankings available for the selected sport and week. Please choose a different option.</div>
                                        ) : (
                                            /*<div><LeaderboardProfiles userIds={leaderboard.map(entry => entry.user_id)}></LeaderboardProfiles></div>*/
                                            <div><LeaderboardProfiles sport={ selectedSport } week={ selectedWeek } userIds={leaderboard.map(entry => entry.user_id)}/></div>
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
                    font-size:65px;
                    color: var(--text-color);
                    margin-bottom: 20px;
                    text-align: center;
                }
                 

                .leaderboard-container {
                    background: linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0));
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
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .select option {
                    background-color: #1f2937;
                    color: white;
                }

                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                    
                }


                .leaderboard-header {
                    display: flex;
                    background-color: rgba(255, 255, 255, 0.1);
                    justify-content: space-between;
                    text-transform: uppercase;
                    text-align: center;
                    font-size: 1.3vh;
                    font-weight: 600;
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                }

                .rank {
                    margin-bottom: 5px;
                    text-align: left;
                }

                .points {
                    margin-bottom: 5px;
                    text-align: right;
                    margin-left: 5vh;
                }

                .performance{
                    margin-bottom: 5px;
                    text-align: left;
                    margin-left: 5vh;
                }

                .username {
                    text-align: left;
                    margin-bottom: 5px;
                    margin-right: 5em;
                }
            `}</style>
            </div>
    );
};

export default Leaderboard;