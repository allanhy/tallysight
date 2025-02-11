/* eslint-disable prefer-const */
"use client";

import React, { useState, useEffect } from 'react';
import LeaderboardProfiles from '../components/leaderboardProfiles';

type Sport = 'NFL' | 'MLB' | 'NBA';

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
    const [selectedSport, setSelectedSport] = useState<Sport | 'SELECT'>('SELECT'); // type selected sport
    const [selectedWeek, setSelectedWeek] = useState('-1');

    useEffect(() => {
        // Set the current week when the component mounts
        const week = getCurrentWeek();
        setCurrentWeek(week);

        const fetchLeaderboard = async () => {
            if(!selectedSport || !selectedWeek)
                return;

            setLoading(true);
            setError('');

            try {
                // Getting Users with entries in the sport & week
                const res = await fetch(`/api/leaderboard-entries/get?sport=${selectedSport}&week=${selectedWeek}`);
                const data = await res.json();

                if (res.ok) {
                    setLeaderboard(data.data);
                } else {
                    setError(data.message || "Failed to load leaderboard");
                }   
            } catch (error) {
                setError(`Network error fetching leaderboard: ${error}`);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, [selectedSport, selectedWeek]);   
    
    // Function to get the current week of the year
    const getCurrentWeek = () => {
        const date: Date = new Date();
        const startDate: Date = new Date(date.getFullYear(), 0, 1);
        const days: number = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

    // Generate weeks dynamically starting from current week
    const generateWeeks = () => {
        if (currentWeek === null) {
            return []; // Or return a default value
        }
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
        setSelectedWeek(e.target.value);
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
                                <option value='SELECT' disabled>Select Sport</option>
                                <option value='NFL'>NFL</option>
                                <option value='MLB'>MLB</option>
                                <option value='NBA'>NBA</option>
                            </select>

                            <select 
                                className='select' 
                                value={selectedWeek} 
                                onChange={handleWeekChange}>
                                <option value='-1' disabled>Select Week</option>
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
                                        <div className='points'>Points</div>
                                    </div>
                                        {leaderboard.length <= 0 ? (
                                                <div>No rankings available for the selected sport and week. Please choose a different option.</div>
                                        ) : (
                                            <div><LeaderboardProfiles userIds={leaderboard.map(entry => entry.user_id)}></LeaderboardProfiles></div>
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
                    background: black;
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
                    font-size: 32px;
                    color: white;
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
                    justify-content: space-between;
                    background-color: rgba(255, 255, 255, 0.1);
                    text-transform: uppercase;
                    text-align: center;
                    font-size: 1.5vh;
                    font-weight: bold;
                    color: white;
                    padding: 20px;
                    border-radius: 5px;
                }
            `}</style>
            </div>
    );
};

export default Leaderboard;