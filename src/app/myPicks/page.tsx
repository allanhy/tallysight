'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import '../styles/myPicks.css';


//TODO: Add a history button to the picks page
//FIX: Add a history button to the picks page
// Define TypeScript interfaces for data structures
interface Pick {
    id: string;
    gameId: string;
    teamIndex: number;
    createdAt: string;
    Game: {
        id: string;
        team1Name: string;
        team2Name: string;
        team1Logo: string | null;
        team2Logo: string | null;
        winner: boolean | null;  // 0 for team1, 1 for team2, null for not decided
        final_score: string | null;
        status?: string;
        gameDate: string;
        gameDay: string;
    };
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

// Add this interface for grouped picks
interface GroupedPicks {
    [date: string]: Pick[];
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
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Hooks for authentication and navigation
    const { isSignedIn } = useUser();
    const router = useRouter();

    // Toggle history view
    const handleHistoryClick = () => {
        setIsHistoryActive((prev) => !prev);
    };

    // Fetch user's picks when signed in
    useEffect(() => {
        const fetchUserPicks = async () => {
            try {
                console.log('Fetching picks...'); // Debug log
                const response = await axios.get('/api/userPicks');
                console.log('Response:', response.data); // Debug log

                // Sort picks by gameDate in descending order (newest first)
                const sortedPicks = response.data.sort((a: Pick, b: Pick) => {
                    const dateA = new Date(a.Game.gameDate);
                    const dateB = new Date(b.Game.gameDate);
                    return dateB.getTime() - dateA.getTime(); // Changed to show newest first
                });

                setUserPicks(sortedPicks);
            } catch (error) {
                console.error('Client Error:', error);
            }
        };

        if (isSignedIn) {
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

    // Add this helper function to format dates consistently
    const formatGameDate = (dateString: string) => {
        // Ensure we're working with a valid date string
        if (!dateString) return '';
        
        // Create a date object in the correct timezone
        const date = new Date(dateString);
        
        // Format the date consistently for display and comparison
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'America/New_York'  // Use ET timezone consistently
        });
    };

    // Update the groupPicksByDate function to use the consistent formatter
    const groupPicksByDate = (picks: Pick[]) => {
        console.log("Starting to group picks, count:", picks.length);
        
        // First remove duplicates based on gameId
        const uniquePicks = picks.reduce((acc: Pick[], current) => {
            const exists = acc.find(pick => pick.gameId === current.gameId);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, []);

        // Then group by date using the consistent formatter
        const grouped = uniquePicks.reduce((groups: { [key: string]: Pick[] }, pick) => {
            if (!pick.Game || !pick.Game.gameDate) return groups;
            
            // Use the consistent date formatter
            const dateKey = formatGameDate(pick.Game.gameDate);
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(pick);
            return groups;
        }, {});

        // Sort picks within each group by game time
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => {
                const timeA = new Date(a.Game.gameDate).getTime();
                const timeB = new Date(b.Game.gameDate).getTime();
                return timeA - timeB;
            });
        });

        return grouped;
    };

    // Update the isDateInWeek function to handle timezone consistently
    const isDateInWeek = (date: Date, weekStart: Date, weekEnd: Date) => {
        // Set all dates to midnight ET for comparison
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        
        const normalizedStart = new Date(weekStart);
        normalizedStart.setHours(0, 0, 0, 0);
        
        const normalizedEnd = new Date(weekEnd);
        normalizedEnd.setHours(23, 59, 59, 999);
        
        return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
    };

    // Update the week filtering logic to use the consistent date handling
    const weekFilteredPicks = selectedWeek === 0 
        ? userPicks // Show all picks if no week selected
        : userPicks.filter((pick) => {
            if (!pick.Game || !pick.Game.gameDate) return false;
            
            // Parse the date string properly
            const pickDate = new Date(pick.Game.gameDate);
            const selectedWeekData = weekOptions.find((week) => week.weekNumber === selectedWeek);
            if (!selectedWeekData) return false;
            
            return isDateInWeek(pickDate, selectedWeekData.startDate, selectedWeekData.endDate);
        });

    // Move week options generation to a useEffect to ensure client-side only
    useEffect(() => {
        if (currentWeek !== null) {
            const options = generateWeeks();
            setWeekOptions(options);
        }
    }, [currentWeek]);

    // Update the generateWeeks function to create more accurate week ranges
    const generateWeeks = (): WeekOption[] => {
        const weeks: WeekOption[] = [];
        
        // Start from the beginning of the year
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        yearStart.setHours(0, 0, 0, 0);
        
        // Get the first Sunday of the year (or use Jan 1 if it's a Sunday)
        const firstSunday = new Date(yearStart);
        while (firstSunday.getDay() !== 0) {
            firstSunday.setDate(firstSunday.getDate() + 1);
        }
        
        // Generate 52 weeks
        for (let i = 0; i < 52; i++) {
            const weekStart = new Date(firstSunday);
            weekStart.setDate(firstSunday.getDate() + (i * 7));
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(0, 0, 0, 0);
            
            const weekNumber = i + 1;
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
        return weeks;
    };

    // Add this at the top of your component
    useEffect(() => {
        console.log("Current userPicks state:", userPicks);
        
        if (userPicks.length > 0) {
            // Check the first pick to see its structure
            console.log("Sample pick:", userPicks[0]);
            console.log("Sample Game property:", userPicks[0].Game);
            
            // Check if grouping works
            const grouped = groupPicksByGameDate(userPicks);
            console.log("Grouped picks:", grouped);
            console.log("Grouped keys:", Object.keys(grouped));
        }
    }, [userPicks]);

    // Modify the groupPicksByGameDate function with more logging
    const groupPicksByGameDate = (picks: Pick[]) => {
        console.log("Starting to group picks, count:", picks.length);
        
        if (picks.length > 0) {
            console.log("First pick gameDate:", picks[0].Game?.gameDate);
        }
        
        // First remove duplicates based on gameId
        const uniquePicks = picks.reduce((acc: Pick[], current) => {
            const exists = acc.find(pick => pick.gameId === current.gameId);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, []);

        // Then group by date
        const grouped = uniquePicks.reduce((groups: { [key: string]: Pick[] }, pick) => {
            const gameDate = new Date(pick.Game.gameDate);
            
            // Format the date as a string
            const dateKey = gameDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                timeZone: 'America/New_York'
            });

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(pick);
            return groups;
        }, {});

        // Sort picks within each group by game time
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => {
                const timeA = new Date(a.Game.gameDate).getTime();
                const timeB = new Date(b.Game.gameDate).getTime();
                return timeA - timeB;
            });
        });

        return grouped;
    };

    // At the top of your component, add this useEffect
    useEffect(() => {
        // Set selectedWeek to 0 to show all picks by default
        setSelectedWeek(0);
    }, []);

    // Add this function to get unique days from filtered picks
    const getUniqueDays = (picks: Pick[]) => {
        const days = picks.reduce((acc: string[], pick) => {
            if (!pick.Game || !pick.Game.gameDate) return acc;
            
            const gameDate = new Date(pick.Game.gameDate);
            const dateKey = gameDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                timeZone: 'America/New_York'
            });
            
            if (!acc.includes(dateKey)) {
                acc.push(dateKey);
            }
            
            return acc;
        }, []);
        
        // Sort days chronologically
        return days.sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateA.getTime() - dateB.getTime();
        });
    };

    // Get grouped picks
    const groupedPicks = groupPicksByDate(weekFilteredPicks);

    // Get sorted dates with proper date parsing
    const sortedDates = Object.keys(groupedPicks).sort((a, b) => {
        // Create Date objects from the formatted date strings
        const datePartsA = a.split(', ')[1].split(' ');
        const monthA = datePartsA[0];
        const dayA = parseInt(datePartsA[1]);
        const yearA = parseInt(datePartsA[2]);
        
        const datePartsB = b.split(', ')[1].split(' ');
        const monthB = datePartsB[0];
        const dayB = parseInt(datePartsB[1]);
        const yearB = parseInt(datePartsB[2]);
        
        const dateA = new Date(`${monthA} ${dayA}, ${yearA}`);
        const dateB = new Date(`${monthB} ${dayB}, ${yearB}`);
        
        return dateA.getTime() - dateB.getTime();
    });

    // Update the parseGameDate function to be more robust
    const parseGameDate = (dateString: string) => {
        try {
            // Try to parse the date string
            const date = new Date(dateString);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.error(`Invalid date string: ${dateString}`);
                return new Date(); // Return current date as fallback
            }
            
            // Log the parsed date for debugging
            console.log(`Parsed date: ${dateString} -> ${date.toLocaleString()}`);
            
            return date;
        } catch (error) {
            console.error(`Error parsing date: ${dateString}`, error);
            return new Date(); // Return current date as fallback
        }
    };

    // Add this helper function to check if a date is today
    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // Add this helper function to check if a date is in the future
    const isFutureDate = (date: Date) => {
        const now = new Date();
        // Compare just the dates (ignoring time)
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return dateOnly > todayOnly;
    };

    // Determine if the user's pick was correct
    const isPickCorrect = (teamPicked: number, gameWinner: boolean) => {
        // teamPicked: 1 = Team1, 2 = Team2
        // gameWinner: false = Team1 won, true = Team2 won
        
        if (teamPicked === 1 && gameWinner === false) {
            return true;  // User picked Team1 and Team1 won
        }
        
        if (teamPicked === 2 && gameWinner === true) {
            return true;  // User picked Team2 and Team2 won
        }
        
        return false;  // User's pick was incorrect
    }

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
                                    <option value="0">All Weeks</option>
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

                            {/* Add this debugging section right after your picks-subtitle section */}
                            <div className="debug-section p-4 mb-4 bg-red-800/30 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    Debug Information
                                </h3>
                                <div>
                                    <p className="text-white">Total picks: {userPicks.length}</p>
                                    <p className="text-white">Filtered picks: {weekFilteredPicks.length}</p>
                                    <p className="text-white">Unique dates: {sortedDates.length}</p>
                                    <p className="text-white">Dates: {sortedDates.join(', ')}</p>
                                    
                                    {weekFilteredPicks.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-white font-semibold">Sample Game Dates:</h4>
                                            <ul className="text-white">
                                                {weekFilteredPicks.slice(0, 5).map((pick, index) => (
                                                    <li key={index}>
                                                        Game ID: {pick.gameId}, 
                                                        Raw Date: {pick.Game.gameDate}, 
                                                        Parsed: {new Date(pick.Game.gameDate).toLocaleString('en-US', {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            timeZone: 'America/New_York'
                                                        })}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Replace your existing picks display with this simplified version */}
                            <div className="days-container space-y-6">
                                {sortedDates.map(date => (
                                    <div key={date} className="date-group p-4 bg-gray-800/30 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
                                            {date}
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            {groupedPicks[date].map((pick, index) => (
                                                <div key={`${pick.gameId}-${index}`} 
                                                     className="pick-item bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="pick-details flex items-center justify-between">
                                                        {/* Team 1 */}
                                                        <div className={`team flex items-center gap-3 ${pick.teamIndex === 0 ? 'selected-team' : ''}`}>
                                                            {pick.Game.team1Logo && (
                                                                <img 
                                                                    src={pick.Game.team1Logo} 
                                                                    alt={pick.Game.team1Name} 
                                                                    className="team-logo w-8 h-8 object-contain" 
                                                                />
                                                            )}
                                                            <span className="team-name text-white">{pick.Game.team1Name}</span>
                                                        </div>

                                                        <span className="vs text-gray-400 mx-4">VS</span>

                                                        {/* Team 2 */}
                                                        <div className={`team flex items-center gap-3 ${pick.teamIndex === 1 ? 'selected-team' : ''}`}>
                                                            {pick.Game.team2Logo && (
                                                                <img 
                                                                    src={pick.Game.team2Logo} 
                                                                    alt={pick.Game.team2Name} 
                                                                    className="team-logo w-8 h-8 object-contain" 
                                                                />
                                                            )}
                                                            <span className="team-name text-white">{pick.Game.team2Name}</span>
                                                        </div>

                                                        {/* Game Status */}
                                                        <div className="game-status ml-4">
                                                            {(() => {
                                                                try {
                                                                    // Parse the game date
                                                                    const gameDate = new Date(pick.Game.gameDate);
                                                                    const now = new Date();
                                                                    
                                                                    // Get today's date (without time)
                                                                    const today = new Date();
                                                                    today.setHours(0, 0, 0, 0);
                                                                    
                                                                    // Get tomorrow's date (without time)
                                                                    const tomorrow = new Date(today);
                                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                                    
                                                                    // Get game date without time for comparison
                                                                    const gameDateOnly = new Date(gameDate);
                                                                    gameDateOnly.setHours(0, 0, 0, 0);
                                                                    
                                                                    // Check if game is today or in the future
                                                                    const isGameToday = gameDateOnly.getTime() === today.getTime();
                                                                    const isGameTomorrow = gameDateOnly.getTime() === tomorrow.getTime();
                                                                    const isGameInFuture = gameDateOnly > today;
                                                                    
                                                                    // Check if game has started (current time is past game time)
                                                                    const hasGameStarted = now > gameDate;
                                                                    
                                                                    // Game status logic
                                                                    if (isGameInFuture) {
                                                                        if (isGameToday) {
                                                                            // Game is today but hasn't started yet
                                                                            return (
                                                                                <div className="pick-result upcoming">
                                                                                    Today at {gameDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                                </div>
                                                                            );
                                                                        } else if (isGameTomorrow) {
                                                                            // Game is tomorrow
                                                                            return (
                                                                                <div className="pick-result upcoming">
                                                                                    Tomorrow at {gameDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            // Game is in the future (not today or tomorrow)
                                                                            const options: Intl.DateTimeFormatOptions = { 
                                                                                weekday: 'short', 
                                                                                month: 'short', 
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                                timeZone: 'America/New_York'  // Specify timezone explicitly
                                                                            };
                                                                            return (
                                                                                <div className="pick-result upcoming">
                                                                                    {gameDate.toLocaleDateString('en-US', options)}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    } else {
                                                                        // Game is in the past or today and has started
                                                                        if (pick.Game.winner !== null) {
                                                                            // Game has a winner
                                                                            
                                                                            // Determine if user won based on their pick and the game result
                                                                            // If user picked team1 (teamIndex === 0), they win if winner is false
                                                                            // If user picked team2 (teamIndex === 1), they win if winner is true
                                                                            const userWon = (pick.teamIndex === 0 && pick.Game.winner === false) || 
                                                                                            (pick.teamIndex === 1 && pick.Game.winner === true);
                                                                            
                                                                            return (
                                                                                <div className={`pick-result ${userWon ? 'win' : 'loss'}`}>
                                                                                    {userWon ? 'Won' : 'Lost'}
                                                                                    {pick.Game.final_score && (
                                                                                        <span className="ml-1">({pick.Game.final_score})</span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        } else if (hasGameStarted) {
                                                                            // Game has started but no winner yet
                                                                            return (
                                                                                <div className="pick-result in-progress">
                                                                                    In Progress
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            // Fallback for edge cases
                                                                            return (
                                                                                <div className="pick-result upcoming">
                                                                                    Scheduled
                                                                                </div>
                                                                            );
                                                                        }
                                                                    }
                                                                } catch (error) {
                                                                    console.error("Error rendering game status:", error);
                                                                    return (
                                                                        <div className="pick-result upcoming">
                                                                            Scheduled
                                                                        </div>
                                                                    );
                                                                }
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                .pick-result {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 500;
                    text-align: center;
                    min-width: 80px;
                }

                .win {
                    background-color: #22c55e;
                    color: white;
                }

                .loss {
                    background-color: #ef4444;
                    color: white;
                }

                .in-progress {
                    background-color: #3b82f6;
                    color: white;
                }

                .upcoming {
                    background-color: #6b7280;
                    color: white;
                }
                
                .finished {
                    background-color: #4b5563;
                    color: white;
                }
                
                .selected-team {
                    font-weight: bold;
                    position: relative;
                }
                
                .selected-team::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-color: #3b82f6;
                }
            `}</style>
        </div>
    );
}
