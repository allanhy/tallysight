'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import '../styles/myPicks.css';

interface Pick {
    gameId: string;
    teamIndex: number;
}

interface Game {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo: string;
    awayTeamLogo: string;
}

interface TeamDetails {
    name: string;
    logo: string;
}

type Sport = 'NFL' | 'MLB' | 'NBA';

export default function MyPicksPage() {
    const [isHistoryActive, setIsHistoryActive] = useState(false);
    const [userPicks, setUserPicks] = useState<Pick[]>([]);
    const { isSignedIn } = useUser();
    const router = useRouter();
    const [gamesData, setGamesData] = useState<Game[]>([]);
    const [weekStart, setWeekStart] = useState<string | null>(null);
    const [weekEnd, setWeekEnd] = useState<string | null>(null);
    const [currentWeek, setCurrentWeek] = useState<number | null>(null);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(0);

    // Toggle History
    const handleHistoryClick = () => {
        setIsHistoryActive((prev) => !prev);
    };

    useEffect(() => {
        if (isSignedIn) {
            const fetchUserPicks = async () => {
                try {
                    const response = await axios.get('/api/userPicks');
                    setUserPicks(response.data);
                } catch (error) {
                    console.error('Error fetching user picks:', error);
                }
            };
            fetchUserPicks();
        }
    }, [isSignedIn]);

    useEffect(() => {
        // Fetch game data
        const fetchGamesData = async () => {
            try {
                const response = await axios.get('/api/games');
                setGamesData(response.data.games);
                setWeekStart(response.data.weekStart);
                setWeekEnd(response.data.weekEnd);
            } catch (error) {
                console.error('Error fetching games data:', error);
            }
        };
        fetchGamesData();
    }, []);

    useEffect(() => {
        // Set the current week
        const week = getCurrentWeek();
        setCurrentWeek(week);
        setSelectedWeek(week);
    }, []);

    const getTeamDetails = (gameId: string, teamIndex: number): TeamDetails | null => {
        const game = gamesData.find((g) => g.id === gameId);
        if (!game) return null;

        return teamIndex === 0
            ? { name: game.homeTeam, logo: game.homeTeamLogo }
            : { name: game.awayTeam, logo: game.awayTeamLogo };
    };

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

    const getCurrentWeek = () => {
        const date = new Date();
        const startDate = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

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

    return (
        <div className="picks-page">
            {/* Single history button */}
            <div className="history-button-container">
                <button className="history-button" onClick={handleHistoryClick}>
                    {isHistoryActive ? 'Close' : 'History'}
                </button>
            </div>

            <div className={`content-wrapper ${isSignedIn ? 'centered' : ''}`}>
                <div className="main-content">
                    <h1 className="picks-title">My Picks</h1>

                    {/* Conditional rendering for History or Picks */}
                    {isHistoryActive ? (
                        <div className="picks-container bg-gradient-to-r from-gray-900 to-black text-white">
                            <h2 className="history-title text-white">History</h2>
                            <table className="history-table w-full">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Date</th>
                                        <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Sport</th>
                                        <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Week</th>
                                        <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                        <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                        <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                        <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="picks-container bg-gradient-to-r from-gray-900 to-black text-white">
                            {/* Sport and Week Selection Dropdowns */}
                            <div className="picks-controls">
                                <select className="select" onChange={(e) => setSelectedSport(e.target.value as Sport)} value={selectedSport || ''}>
                                    <option value="" disabled>Select Sport</option>
                                    <option value="NFL">NFL</option>
                                    <option value="MLB">MLB</option>
                                    <option value="NBA">NBA</option>
                                </select>
                                <select className="select" onChange={(e) => setSelectedWeek(parseInt(e.target.value))} value={selectedWeek}>
                                    {generateWeeks().map((week) => (
                                        <option key={week} value={week}>{week}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Current Picks Display */}
                            <h2 className="picks-subtitle">Picks</h2>
                            <div className="picks-date">
                                {weekStart && weekEnd && (
                                    <div className="text-md text-gray-600">
                                        {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} - {new Date(weekEnd).toLocaleDateString('en-US', { day: 'numeric' })}
                                    </div>
                                )}
                            </div>

                            {isSignedIn && userPicks.length > 0 ? (
                                userPicks.map((pick, index) => {
                                    const teamDetails = getTeamDetails(pick.gameId, pick.teamIndex);
                                    if (!teamDetails) return null;

                                    return (
                                        <div key={index} className="pick-item">
                                            <div className="pick-details">
                                                <img src={teamDetails.logo} alt={teamDetails.name} className="team-logo" />
                                                <div className="team-name">{teamDetails.name}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="message">No picks available. Please make your picks!</div>
                            )}
                        </div>
                    )}
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
