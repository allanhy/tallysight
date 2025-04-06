/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import '../styles/myPicks.css';
import { Skeleton } from '../components/ui/skeleton';
import { format, parseISO, compareDesc, formatDistanceToNow, isAfter } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { isTomorrow, isToday } from 'date-fns';
import { PrismaClient } from '@prisma/client';
import { PcCaseIcon } from 'lucide-react';
const prisma = new PrismaClient();


//TODO: Add a history button to the picks page
//FIX: Add a history button to the picks page
// Define TypeScript interfaces for data structures
interface Pick {
    id: string;
    gameId: string;
    teamIndex: number;
    createdAt: string;
    bestPick: boolean;
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
        sport?: string;
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

// 2. In your UI, you might add a form to update game times
// This could be in an admin component
interface GameEditorProps {
    game: {
        id: string;
        gameDate: string;
    }
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
    const [userTimeZone, setUserTimeZone] = useState<string>('America/New_York'); // Default timezone
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groupedPicks, setGroupedPicks] = useState<GroupedPicks>({});

    // Hooks for authentication and navigation
    const { isSignedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const sportParam = searchParams.get('sport') as Sport;
        if (sportParam) {
            setSelectedSport(sportParam);  // Automatically select the sport from the URL
        }
        console.log(selectedSport);
    }, []);

    // Fetch user's picks when signed in
    useEffect(() => {
        const fetchUserPicks = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/userPicks');
                if (!response.ok) {
                    throw new Error('Failed to fetch picks');
                }
                const data = await response.json();
                
                //console.log('Received picks from API:', data.length);
                
                // Make sure we have valid data
                if (!Array.isArray(data)) {
                    //console.error('Expected array but got:', typeof data, data);
                    setUserPicks([]);
                    setLoading(false);
                    return;
                }

                // Log the first few picks for debugging
                if (data.length > 0) {
                    //console.log('First pick:', data[0]);
                    if (data.length > 1) console.log('Second pick:', data[1]);
                }

                // No need to sort again if already sorted on the server
                setUserPicks(data);

                // Group the picks by date for display
                const groupedPicks = groupPicksByDate(data);
                setGroupedPicks(groupedPicks);

            } catch (error) {
                //console.error('Error fetching picks:', error);
                setError('Failed to load picks. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (isSignedIn) {
            fetchUserPicks();
        } else {
            setLoading(false);
        }
    }, [isSignedIn]);

    // Fetch games data on component mount
    useEffect(() => {
        const fetchGamesData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/games');
                setGamesData(response.data.games);
                setWeekStart(response.data.weekStart);
                setWeekEnd(response.data.weekEnd);
            } catch (error) {
                //console.error('Error fetching games data:', error);
            } finally {
                setLoading(false);
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

    // Add this useEffect to detect the user's timezone
    useEffect(() => {
        // Get the user's timezone using Intl API
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserTimeZone(timezone);
        //console.log("User timezone detected:", timezone);
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

    // Replace ensureConsistentDate with a date-fns approach
    const parseConsistentDate = (dateInput: string | Date | null): Date => {
        try {
            if (!dateInput) return new Date(); // Still need a fallback

            if (dateInput instanceof Date) {
                return parseISO(format(dateInput, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''));
            }

            if (typeof dateInput === 'string') {
                return parseISO(dateInput);
            }
            
            //console.error(`Unexpected date type: ${typeof dateInput}`);
            return parseISO(new Date().toISOString());
        } catch (error) {
            //console.error(`Error parsing date: ${dateInput}`, error);
            return parseISO(new Date().toISOString());
        }
    };

    // Format dates with user's timezone
    const formatDateWithTimezone = (date: Date, formatStr: string = 'EEEE, MMM d, h:mm a'): string => {
        try {
            // Convert to user's timezone
            const zonedDate = toZonedTime(date, userTimeZone);
            return format(zonedDate, formatStr);
        } catch (error) {
            //console.error(`Error formatting date: ${date}`, error);
            return 'Invalid date';
        }
    };

    // Add a function for relative time
    const getRelativeTime = (date: Date): string => {
        try {
            const now = new Date();
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            //console.error(`Error getting relative time: ${date}`, error);
            return 'Unknown time';
        }
    };

    // Completely replace the groupPicksByDate function
    const groupPicksByDate = (picks: Pick[]): GroupedPicks => {
        if (!picks || picks.length === 0) return {};

        // Group by formatted date string (ignoring time)
        const grouped: GroupedPicks = {};

        for (const pick of picks) {
            if (!pick.Game?.gameDate) continue;

            // Parse the date - it's likely in UTC
            const utcDate = new Date(pick.Game.gameDate);

            // Convert to local timezone for display
            // This explicitly handles the timezone conversion
            const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));

            // Format just the date part (no time) to group by day
            const dateKey = localDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }

            grouped[dateKey].push(pick);
        }

        // Sort each group by time
        Object.keys(grouped).forEach(dateKey => {
            grouped[dateKey].sort((a, b) => {
                if (!a.Game?.gameDate || !b.Game?.gameDate) return 0;

                const dateA = new Date(a.Game.gameDate);
                const dateB = new Date(b.Game.gameDate);

                return dateA.getTime() - dateB.getTime();
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
        //console.log("Current userPicks state:", userPicks);
        
        if (userPicks.length > 0) {
            // Check the first pick to see its structure
            //console.log("Sample pick:", userPicks[0]);
            //console.log("Sample Game property:", userPicks[0].Game);
            
            // Check if grouping works
            const grouped = groupPicksByDate(userPicks);
            //console.log("Grouped picks:", grouped);
            //console.log("Grouped keys:", Object.keys(grouped));
        }
    }, [userPicks]);

    // Modify the groupPicksByGameDate function with more logging
    const groupPicksByGameDate = (picks: Pick[]) => {
        //console.log("Starting to group picks, count:", picks.length);
        
        if (picks.length > 0) {
            //console.log("First pick gameDate:", picks[0].Game?.gameDate);
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



    // Update the sortedDates logic to be more resilient
    const sortedDates = Object.keys(groupedPicks).sort((a, b) => {
        try {
            // More robust date parsing for the formatted strings
            // Add the current year to make parsing more reliable
            const currentYear = new Date().getFullYear();
            const dateAString = a.replace(/(\w+), (\w+) (\d+)/, `$2 $3, ${currentYear}`);
            const dateBString = b.replace(/(\w+), (\w+) (\d+)/, `$2 $3, ${currentYear}`);

            const dateA = parseISO(dateAString);
            const dateB = parseISO(dateBString);

            // Sort in descending order (newest first)
            return compareDesc(dateA, dateB);
        } catch (error) {
            //console.error("Error sorting dates:", error, a, b);
            return 0; // Return 0 if comparison fails
        }
    });

    // Update the parseGameDate function to be more robust
    const parseGameDate = (dateString: string) => {
        try {
            // Try to parse the date string
            const date = new Date(dateString);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                //console.error(`Invalid date string: ${dateString}`);
                return new Date(); // Return current date as fallback
            }

            // Log the parsed date for debugging
            //console.log(`Parsed date: ${dateString} -> ${date.toLocaleString()}`);
            
            return date;
        } catch (error) {
            //console.error(`Error parsing date: ${dateString}`, error);
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

    // Update the renderGameStatus function to use date-fns consistently
    const renderGameStatus = (pick: Pick) => {
        try {
            const gameDate = parseConsistentDate(pick.Game.gameDate);
            const now = new Date();

            // Use date-fns functions for comparisons
            const gameIsToday = isToday(gameDate);
            const gameIsTomorrow = isTomorrow(gameDate);
            const gameInFuture = isAfter(gameDate, now);
            const gameStarted = isAfter(now, gameDate);

            // Format the game time
            const gameTime = formatDateWithTimezone(gameDate, 'h:mm a');
            const relativeTime = getRelativeTime(gameDate);

            if (gameInFuture) {
                if (gameIsToday) {
                    return (
                        <div className="pick-result upcoming">
                            Today at {gameTime}
                        </div>
                    );
                } else if (gameIsTomorrow) {
                    return (
                        <div className="pick-result upcoming">
                            Tomorrow at {gameTime}
                        </div>
                    );
                } else {
                    return (
                        <div className="pick-result upcoming">
                            {formatDateWithTimezone(gameDate, 'EEE, MMM d')} at {gameTime}
                        </div>
                    );
                }
            } else {
                // Game is in the past or today and has started
                if (pick.Game.winner !== null) {
                    // Game has a winner
                    const userWon = (pick.teamIndex === 0 && pick.Game.winner === false) ||
                        (pick.teamIndex === 1 && pick.Game.winner === true);

                    return (
                        <div className={`pick-result ${userWon ? 'win' : 'loss'}`}>
                            {userWon ? 'Won' : 'Lost'} ({relativeTime})
                            {pick.Game.final_score && (
                                <span className="ml-1">({pick.Game.final_score})</span>
                            )}
                        </div>
                    );
                } else if (gameStarted) {
                    return (
                        <div className="pick-result in-progress">
                            In Progress ({relativeTime})
                        </div>
                    );
                } else {
                    return (
                        <div className="pick-result upcoming">
                            Scheduled
                        </div>
                    );
                }
            }
        } catch (error) {
            //console.error("Error rendering game status:", error);
            return (
                <div className="pick-result upcoming">
                    Scheduled (Error)
                </div>
            );
        }
    };

    // 1. First, update your API endpoint that creates or updates games
    // This would be in a separate file like src/app/api/games/route.ts
    async function updateGameWithTime(gameId: string, gameDate: string, gameTime: string) {
        try {
            // Combine date and time into a single ISO string
            const [year, month, day] = gameDate.split('-').map(Number);
            const [hours, minutes] = gameTime.split(':').map(Number);

            // Create a Date object in UTC
            const gameDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

            // Update the game in your database
            await prisma.game.update({
                where: { id: gameId },
                data: {
                    gameDate: gameDateTime.toISOString()
                }
            });

            return { success: true };
        } catch (error) {
            //console.error("Error updating game time:", error);
            return { success: false, error };
        }
    }

    // 2. In your UI, you might add a form to update game times
    // This could be in an admin component
    function GameTimeEditor({ game }: GameEditorProps) {
        const [date, setDate] = useState(game.gameDate.split('T')[0]);
        const [time, setTime] = useState('19:00'); // Default to 7:00 PM

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const response = await fetch('/api/games/updateTime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: game.id,
                    gameDate: date,
                    gameTime: time
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('Game time updated successfully!');
            } else {
                alert('Failed to update game time');
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
                <button type="submit">Update Game Time</button>
            </form>
        );
    }

    // function to get different sports from the picks
    const getUniqueSports = () => {
        const sports = userPicks.reduce((acc: string[], pick) => {
            if (pick.Game?.sport && !acc.includes(pick.Game.sport)) {
                acc.push(pick.Game.sport);
            }
            return acc;
        }, []);
        
        return sports.sort();
    };

    // new week and sport filter
    useEffect(() => {
        if (!userPicks.length) return;

        const filtered = userPicks.filter((pick) => {
            // sport filter if selected
            if (selectedSport !== null && pick.Game?.sport !== selectedSport) {
                return false;
            }
            
            // week filter if selected
            if (selectedWeek !== 0) {
                if (!pick.Game?.gameDate) return false;

                const pickDate = new Date(pick.Game.gameDate);
                const selectedWeekData = weekOptions.find((week) => week.weekNumber === selectedWeek);
                if (!selectedWeekData) return false;

                return isDateInWeek(pickDate, selectedWeekData.startDate, selectedWeekData.endDate);
            }
            
            return true;
        });

        setGroupedPicks(groupPicksByDate(filtered));
    }, [selectedSport, selectedWeek, userPicks, weekOptions]);

    
    // calculation or replace it with this if needed for debugging:
    const weekFilteredPicks = Object.values(groupedPicks).flat();

    if (loading) {
        return (
            <div className="picks-page">
                <div className="content-wrapper centered">
                    <div className="main-content">
                        <h1 className="picks-title text-black dark:text-white">
                            My Picks
                        </h1>

                        {/* Conditional rendering for History or Picks */}
                        {isHistoryActive ? (
                        <div className="picks-container text-black bg-gradient-to-r from-white to-gray-100 dark:text-white dark:from-gray-900 dark:to-gray-950">
                            <h2 className="history-title text-black dark:text-white">History</h2>
                            <table className="history-table w-full">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-800/50 text-black dark:text-white p-4 border border-gray-700">Date</th>
                                        <th className="bg-gray-800/50 text-black dark:text-white p-4 border border-gray-700">Sport</th>
                                        <th className="bg-gray-800/50 text-black dark:text-white p-4 border border-gray-700">Week</th>
                                        <th className="bg-gray-800/50 text-black dark:text-white p-4 border border-gray-700">Result</th>
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
                        <div className="picks-container text-black bg-gradient-to-r from-white to-gray-100 dark:text-white dark:from-gray-900 dark:to-gray-950">
                            <div className="picks-controls flex flex-wrap gap-4 mb-6">
                                <Skeleton className="h-10 w-full rounded-md bg-gray-600" />
                                <h2 className="picks-subtitle">Picks</h2>
                            </div>

                            <div className="days-container space-y-6">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                                        <Skeleton className="h-6 w-1/3 mb-4" />
                                        <div className="space-y-4">
                                            {[...Array(2)].map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className="pick-item bg-gray-800/50 p-4 rounded-lg"
                                                >
                                                    <div className="pick-details flex items-center justify-between">
                                                        <div className="team flex items-center gap-3">
                                                            <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
                                                            <Skeleton className="h-4 w-20 bg-gray-500" />
                                                        </div>

                                                        <Skeleton className="h-4 w-8" />

                                                        <div className="team flex items-center gap-3">
                                                            <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
                                                            <Skeleton className="h-4 w-20 bg-gray-500" />
                                                        </div>

                                                        <Skeleton className="h-4 w-24 bg-gray-600" />
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
                </div>
            </div>
        );
    }

    return (
        <div className="picks-page">
            <div className={`content-wrapper ${isSignedIn ? 'centered' : ''}`}>
                <div className="main-content">
                    <h1 className="picks-title text-black dark:text-white">My Picks</h1>
                    <div className="picks-container text-black bg-gradient-to-r from-white to-gray-100 dark:text-white dark:from-gray-900 dark:to-gray-950">
                        {/* Sport and Week Selection Dropdowns */}
                        <div className="picks-controls">
                        <select 
                                    className="select text-black bg-gray-300/90 dark:text-white dark:bg-gray-800" 
                                    onChange={(e) => setSelectedSport(e.target.value === "" ? null : e.target.value as Sport)} 
                                    value={selectedSport || ''}
                                >
                                    <option value="">All Sports</option>
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
                                className="select text-black bg-gray-300/90 dark:text-white dark:bg-gray-800"
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
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                                Debug Information
                            </h3>
                            <div>
                                <p className="text-black dark:text-white">Total picks: {userPicks.length}</p>
                                <p className="text-black dark:text-white">Filtered picks: {weekFilteredPicks.length}</p>
                                <p className="text-black dark:text-white">Unique dates: {sortedDates.length}</p>
                                <p className="text-black dark:text-white">Dates: {sortedDates.join(', ')}</p>

                                {weekFilteredPicks.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-black dark:text-white font-semibold">Sample Game Dates:</h4>
                                        <ul className="text-black dark:text-white">
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

                        {/* Display all the users picks */}
                        <div className="days-container space-y-6">
                            {loading ? (
                                // Skeleton Loader
                                <div className="flex flex-col gap-4">
                                    {[...Array(3)].map((_, index) => (
                                        <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                                            <Skeleton className="h-6 w-1/3 mb-4" />
                                            <div className="space-y-4">
                                                {[...Array(2)].map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="pick-item bg-gray-800/50 p-4 rounded-lg"
                                                    >
                                                        <div className="pick-details flex items-center justify-between">
                                                            <div className="team flex items-center gap-3">
                                                                <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
                                                                <Skeleton className="h-4 w-20 bg-gray-500" />
                                                            </div>

                                                            <Skeleton className="h-4 w-8" />

                                                            <div className="team flex items-center gap-3">
                                                                <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
                                                                <Skeleton className="h-4 w-20 bg-gray-500" />
                                                            </div>

                                                            <Skeleton className="h-4 w-24" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : userPicks.length > 0 ? (
                                sortedDates.map(date => (
                                    <div key={date} className="date-group p-4 bg-gray-300/30 dark:bg-gray-800/30 rounded-lg">
                                        <h3 className="text-lg font-semibold text-black dark:text-white mb-4 border-b border-gray-700 pb-2">
                                            {date}
                                        </h3>

                                        <div className="space-y-4">
                                            {groupedPicks[date].map((pick, index) => (
                                                <div key={`${pick.gameId}-${index}`}
                                                    className="pick-item bg-gray-300/50 dark:bg-gray-800/50 p-4 rounded-lg">
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
                                                            <span className="team-name text-gray-700 dark:text-gray-400 ">{pick.Game.team1Name}</span>
                                                            {/*For best pick star on team 0*/}
                                                            {pick.bestPick && pick.teamIndex === 0 && (
                                                                <span className="best-pick font-medium text-yellow-500">★</span>
                                                            )}
                                                        </div>

                                                        <span className="text-gray-700 dark:text-gray-500 font-medium mx-4">VS</span>

                                                        {/* Team 2 */}
                                                        <div className={`team flex items-center gap-3 ${pick.teamIndex === 1 ? 'selected-team' : ''}`}>
                                                            {pick.Game.team2Logo && (
                                                                <img
                                                                    src={pick.Game.team2Logo}
                                                                    alt={pick.Game.team2Name}
                                                                    className="team-logo w-8 h-8 object-contain"
                                                                />
                                                            )}
                                                            <span className="team-name text-gray-700 dark:text-gray-400">{pick.Game.team2Name}</span>
                                                            {/*For best pick star on team 1*/}
                                                            {pick.bestPick && pick.teamIndex === 1 && (
                                                                <span className="best-pick font-medium text-yellow-500">★</span>
                                                            )}
                                                        </div>

                                                        {/* Game Status */}
                                                        <div className="game-status ml-4">
                                                            {renderGameStatus(pick)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-white text-xl font-bold bg-gray-800/50 p-4 rounded-lg">
                                    {isSignedIn
                                        ? `No picks made for ${selectedSport || 'this sport'}.`
                                        : "Sign in to make picks."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* New to TallySight section */}
                {!isSignedIn && (
                    <div className="auth-container">
                        <h2 className="auth-title  text-black dark:text-white">New to TallySight?</h2>
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
