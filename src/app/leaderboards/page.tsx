"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import '../styles/leaderboard.css';

type Sport = 'NFL' | 'MLB' | 'NBA';

export default function Page() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [currentWeek, setCurrentWeek] = useState<number | null>(null);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null); // Type selectedSport
    const [selectedWeek, setSelectedWeek] = useState<number>(0);

    // Mock data for each sport (currently the weeks are swapped so if it says 1 it would be the current week or the first option in the select week)
    const mockData: Record<Sport, { rank: number; username: string; performance: string; points: number, week: number }[]> = {
        NFL: [
            { rank: 1, username: 'Player1', performance: 'Good', points: 100, week: 1 },
            { rank: 2, username: 'Player2', performance: 'Excellent', points: 90, week: 1 },
            { rank: 3, username: 'Player3', performance: 'Average', points: 80, week: 1 },
            { rank: 4, username: 'Player4', performance: 'Good', points: 70, week: 1 },
            { rank: 1, username: 'Player1', performance: 'Excellent', points: 110, week: 4 },
            { rank: 2, username: 'Player2', performance: 'Good', points: 105, week: 4 },
            { rank: 3, username: 'Player3', performance: 'Average', points: 95, week: 4 },
            { rank: 4, username: 'Player4', performance: 'Fair', points: 85, week: 4 },
        ],
        MLB: [
            { rank: 1, username: 'Player5', performance: 'Great', points: 120, week: 6 },
            { rank: 2, username: 'Player6', performance: 'Good', points: 110, week: 6 },
            { rank: 3, username: 'Player7', performance: 'Good', points: 100, week: 6 },
            { rank: 4, username: 'Player8', performance: 'Fair', points: 90, week: 6 },
            { rank: 1, username: 'Player5', performance: 'Good', points: 115, week: 4 },
            { rank: 2, username: 'Player6', performance: 'Excellent', points: 110, week: 4 },
            { rank: 3, username: 'Player7', performance: 'Average', points: 105, week: 4 },
            { rank: 4, username: 'Player8', performance: 'Fair', points: 95, week: 4 },
        ],
        NBA: [
            { rank: 1, username: 'Player9', performance: 'Excellent', points: 150, week: 1 },
            { rank: 2, username: 'Player10', performance: 'Good', points: 140, week: 1 },
            { rank: 3, username: 'Player11', performance: 'Average', points: 130, week: 1 },
            { rank: 4, username: 'Player12', performance: 'Poor', points: 120, week: 1 },
            { rank: 1, username: 'Player9', performance: 'Excellent', points: 160, week: 4 },
            { rank: 2, username: 'Player10', performance: 'Good', points: 155, week: 4 },
            { rank: 3, username: 'Player11', performance: 'Average', points: 145, week: 4 },
            { rank: 4, username: 'Player12', performance: 'Poor', points: 130, week: 4 },
        ]
    };


    // Function to get the current week of the year
    const getCurrentWeek = () => {
        const date: Date = new Date();
        const startDate: Date = new Date(date.getFullYear(), 0, 1);
        const days: number = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

    useEffect(() => {
        // Set the current week when the component mounts
        const week = getCurrentWeek();
        setCurrentWeek(week);
        setSelectedWeek(week);
    }, []);

    // Navigation: Redirects user to sign-in page
    const handleSignIn = async () => {
        if (!isSignedIn) {
            const returnUrl = window.location.pathname;
            router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`); // Update this path to match your sign-in page route
            return;
        }
    };

    const handleSignUp = async () => {
        if (!isSignedIn) {
            const returnUrl = window.location.pathname;
            router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`); // Update this path to match your sign-in page route
            return;
        }
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
    };

    const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWeek(parseInt(e.target.value));
    };

    // Get the leaderboard data for the selected sport
    const leaderboardData = selectedSport ? mockData[selectedSport].filter(entry => entry.week === selectedWeek) : [];

    return (
        <div className='leaderboard-page'>
            <div className={`content-wrapper ${isSignedIn ? 'centered' : ''}`}>
                <div className="main-content">
                    <h1 className="leaderboard-title">Leaderboard</h1>
                    <div className="leaderboard-container">
                        <div className="leaderboard-controls">
                            <select className="select" onChange={handleSportChange} value={selectedSport || ''}>
                                <option value="" disabled={!!selectedSport}>Select Sport</option>
                                <option>NFL</option>
                                <option>MLB</option>
                                <option>NBA</option>
                            </select>
                            <select
                                className="select"
                                onChange={handleWeekChange}
                                value={selectedWeek}
                            >
                                {generateWeeks().map((week, index) => (
                                    <option key={index} value={currentWeek ? currentWeek - index : index + 1}>{week}</option>))}
                            </select>
                        </div>

                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Username</th>
                                    <th>Performance</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.length > 0 ? (
                                    leaderboardData.map((entry) => (
                                        <tr key={entry.rank}>
                                            <td>{entry.rank}</td>
                                            <td>{entry.username}</td>
                                            <td>{entry.performance}</td>
                                            <td>{entry.points}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                                            No data available for the selected sport and week. Please choose a different option.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {!isSignedIn && (
                    <div className="auth-container">
                        <h2 className="auth-title">New to TallySight?</h2>
                        <button
                            onClick={handleSignUp}
                            className="sign-up-button"
                        >
                            Sign up
                        </button>
                        <button
                            onClick={handleSignIn}
                            className="sign-in-button"
                        >
                            Log in
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}