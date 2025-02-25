'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import '../styles/myPicks.css';

// Define TypeScript interfaces for data structures
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

// Interface for week options
interface WeekOption {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    label: string;
}

export default function MyPicksPage() {
    // State management for UI controls
    const [isHistoryActive, setIsHistoryActive] = useState(false);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<number>(0);
    
    // State management for data
    const [userPicks, setUserPicks] = useState<Pick[]>([]);
    const [gamesData, setGamesData] = useState<Game[]>([]);
    const [weekStart, setWeekStart] = useState<string | null>(null);
    const [weekEnd, setWeekEnd] = useState<string | null>(null);
    const [currentWeek, setCurrentWeek] = useState<number | null>(null);
    const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);
    
    // Hooks for authentication and navigation
    const { isSignedIn } = useUser();
    const router = useRouter();

    // Toggle history view
    const handleHistoryClick = () => {
        setIsHistoryActive((prev) => !prev);
    };

    // Fetch user's picks when signed in
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

    // Fetch games data on component mount
    useEffect(() => {
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

    // Set current week on component mount
    useEffect(() => {
        const week = getCurrentWeek();
        setCurrentWeek(week);
        setSelectedWeek(week);
    }, []);

    // Helper function to get team details from game data
    const getTeamDetails = (gameId: string, teamIndex: number): TeamDetails | null => {
        const game = gamesData.find((g) => g.id === gameId);
        if (!game) return null;

        return teamIndex === 0
            ? { name: game.homeTeam, logo: game.homeTeamLogo }
            : { name: game.awayTeam, logo: game.awayTeamLogo };
    };

    // Authentication handlers
    const handleSignIn = async () => {
        if (!isSignedIn) {
            const returnUrl = window.location.pathname;
            router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
        }
    };

    const handleSignUp = async () => {
        if (!isSignedIn) {
            const returnUrl = window.location.pathname;
            router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`);
        }
    };

    // Helper function to calculate current week number
    const getCurrentWeek = () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        const startDate = new Date(date.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

    // Generate array of week options with dates
    const generateWeeks = (): WeekOption[] => {
        if (currentWeek === null) return [];
        
        const weeks: WeekOption[] = [];
        const weeksToDisplay = 52;
        
        // Use a fixed date for initial render to avoid hydration mismatch
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get the start of the current week (Sunday)
        const currentWeekStart = new Date(today);
        const day = currentWeekStart.getDay();
        currentWeekStart.setDate(currentWeekStart.getDate() - day);
        currentWeekStart.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < weeksToDisplay; i++) {
            const weekStart = new Date(currentWeekStart);
            weekStart.setDate(currentWeekStart.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(0, 0, 0, 0);
            
            const weekNumber = currentWeek - i;
            if (weekNumber > 0) {
                // Use consistent date formatting
                const formattedStart = new Intl.DateTimeFormat('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    timeZone: 'UTC'
                }).format(weekStart);
                
                const formattedEnd = new Intl.DateTimeFormat('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    timeZone: 'UTC'
                }).format(weekEnd);
                
                weeks.push({
                    weekNumber,
                    startDate: weekStart,
                    endDate: weekEnd,
                    label: `Week ${weekNumber} (${formattedStart} - ${formattedEnd})`
                });
            }
        }
        return weeks;
    };

    // Move week options generation to a useEffect to ensure client-side only
    useEffect(() => {
        if (currentWeek !== null) {
            const options = generateWeeks();
            setWeekOptions(options);
        }
    }, [currentWeek]);

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
                                <select 
                                    className="select" 
                                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))} 
                                    value={selectedWeek}
                                >
                                    <option value="" disabled>Select Week</option>
                                    {weekOptions.map((week) => (
                                        <option key={week.weekNumber} value={week.weekNumber}>
                                            {week.label}
                                        </option>
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

                {/* New to TallySight section */}
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

            <style jsx>{`
                .picks-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: black;
                    position: relative;
                }

                .content-wrapper {
                    display: flex;
                    flex-direction: row; /* Align elements side by side */
                    gap: 24px;
                    justify-content: center;
                    align-items: flex-start; /* Align items to the top */
                    width: 100%;
                    max-width: 1200px;
                }

                .picks-container {
                    width: 100%; /* Ensure the picks container takes full width */
                    max-width: 1000px; /* Limit max width for larger screens */
                }

                .auth-container {
                    background: linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0));
                    padding: 24px;
                    border-radius: 8px;
                    text-align: center;
                    width: 300px; /* Default width for larger screens */
                    height: fit-content;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    margin-top: 0; /* Remove top margin to align with table */
                    align-self: flex-start; /* Align to the top */
                    border: 1px solid rgba(78, 29, 29, 0.1);
                }

                .sign-up-button, .sign-in-button {
                    margin-top: 10px; /* Add some space between buttons */
                    padding: 10px 20px; /* Add padding for better button size */
                    color: white; /* Button text color */
                    background-color: #0070f3; /* Button background color */
                    border: none; /* Remove default border */
                    border-radius: 5px; /* Rounded corners */
                    cursor: pointer; /* Pointer cursor on hover */
                }

                .sign-up-button:hover, .sign-in-button:hover {
                    background-color: #005bb5; /* Darker shade on hover */
                }

                @media (max-width: 768px) {
                    .content-wrapper {
                        flex-direction: column; /* Stack elements vertically on small screens */
                    }

                    .auth-container {
                        width: 100%; /* Make auth container full width on small screens */
                        max-width: 1000px; /* Match the picks container width */
                        margin-top: 20px; /* Add margin for spacing */
                    }
                }
            `}</style>
        </div>
    );
}
