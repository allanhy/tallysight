'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Pick {
    id: string;
    gameId: string;
    teamIndex: number;
    createdAt: string;
    userId: string;
}

export default function MyPicks() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [picks, setPicks] = useState<Pick[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSport, setSelectedSport] = useState<string>('');
    const [selectedWeek, setSelectedWeek] = useState<number>(0);
    const [currentWeek, setCurrentWeek] = useState<number | null>(null);

    // Get current week
    const getCurrentWeek = () => {
        const date = new Date();
        const startDate = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

    useEffect(() => {
        const week = getCurrentWeek();
        setCurrentWeek(week);
        setSelectedWeek(week);
    }, []);

    useEffect(() => {
        const fetchPicks = async () => {
            try {
                const response = await fetch('/api/getPicks');
                if (!response.ok) {
                    throw new Error('Failed to fetch picks');
                }
                const data = await response.json();
                console.log('Fetched picks:', data.picks); // Debug log
                setPicks(data.picks);
            } catch (error) {
                console.error('Error fetching picks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isSignedIn) {
            fetchPicks();
        }
    }, [isSignedIn]);

    const generateWeeks = () => {
        if (currentWeek === null) return [];
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

    if (!isSignedIn) {
        return (
            <div className="leaderboard-page">
                <div className="content-wrapper">
                    <div className="auth-container">
                        <h2 className="auth-title">New to TallySight?</h2>
                        <button onClick={() => router.push('/sign-up')} className="sign-up-button">
                            Sign up
                        </button>
                        <button onClick={() => router.push('/sign-in')} className="sign-in-button">
                            Log in
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <div className="content-wrapper">
                <div className="main-content">
                    <h1 className="leaderboard-title">My Picks</h1>
                    <div className="leaderboard-container">
                        <div className="leaderboard-controls">
                            <select 
                                className="select" 
                                onChange={(e) => setSelectedSport(e.target.value)}
                                value={selectedSport}
                            >
                                <option value="">Select Sport</option>
                                <option value="NFL">NFL</option>
                                <option value="MLB">MLB</option>
                                <option value="NBA">NBA</option>
                            </select>
                            <select
                                className="select"
                                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                value={selectedWeek}
                            >
                                {generateWeeks().map((week, index) => (
                                    <option key={index} value={currentWeek ? currentWeek - index : index + 1}>
                                        {week}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Game ID</th>
                                    <th>Selected Team</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {picks.length > 0 ? (
                                    picks.map((pick) => (
                                        <tr key={pick.id || pick.gameId}>
                                            <td>{new Date(pick.createdAt).toLocaleDateString()}</td>
                                            <td>{pick.gameId}</td>
                                            <td>Team {pick.teamIndex + 1}</td>
                                            <td>Pending</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '10px' }}>
                                            No picks available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
} 