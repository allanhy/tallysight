/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from "@clerk/clerk-react";
import { Skeleton } from '../components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../components/ui/tooltip';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover"

import Pusher from "pusher-js";
import useSWR, { mutate } from "swr";
import OddsPreview from '../components/OddsPreview';

interface Team {
    name: string;
    score: number | null;
    spread: string;
    logo?: string;
}

interface Game {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    gameTime: string;
    status: string;
    fullDate?: string;
    dbDate?: string;
    dbTime?: string;
    estDate?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Sport = ['NBA']
const MAXPOINTSPERGAME = 1;
const BONUSPOINTS = 3;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SpreadDisplay = ({ spread, onClick }: { spread: string; onClick: () => void }) => {
    if (spread === 'TBD' || spread === 'N/A') {
        return (
            <button
                onClick={onClick}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
                Get Spread
            </button>
        );
    }
    return <span className="text-gray-700">{spread}</span>;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

export default function DailyPicks() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [pickPercentages, setPickPercentages] = useState<Record<string, { home: string; away: string }>>({});
    const [loadingPercentages, setLoadingPercentages] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
    const [isLocked, setIsLocked] = useState(false);
    const [startedGames, setStartedGames] = useState<Set<string>>(new Set());
    const [firstGameLocked, setFirstGameLocked] = useState(false);
    const [allGamesEnded, setAllGamesEnded] = useState(false);
    const [nextDayTimeLeft, setNextDayTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
    const [previewGame, setPreviewGame] = useState<Game | null>(null);

    const { data: selectionData } = useSWR('/api/userPickPercentage', fetcher, {
        refreshInterval: 0, // Disable polling
    });

    useEffect(() => {
        const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
        checkScreenSize(); // Run on mount
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusher.subscribe("selection-updates");

        channel.bind("update", (newData: { gameId: string; homeTeamPercentage: string; awayTeamPercentage: string }) => {
            console.log("Received live update:", newData);

            // Update pickPercentages with new data
            setPickPercentages(prev => ({
                ...prev,
                [newData.gameId]: {
                    home: newData.homeTeamPercentage,
                    away: newData.awayTeamPercentage
                }
            }));

            // Update SWR cache if needed
            mutate('/api/userPickPercentage');
        });

        return () => {
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getCurrentWeek = () => {
        const date: Date = new Date();
        const startDate: Date = new Date(date.getFullYear(), 0, 1);
        const days: number = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    };

    const { userId } = useAuth();

    useEffect(() => {
        const fetchTodayGames = async () => {
            try {
                const response = await fetch('/api/nba-games', {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch games');
                }

                const data = await response.json();
                data.games.forEach((game: Game) => {
                    console.log(`Game ID: ${game.id}, Status: ${game.status}`);
                });
                setGames(data.games);
            } catch (error) {
                console.error('Error fetching games:', error);
                setError('Failed to load today\'s games');
            } finally {
                setLoading(false);
            }
        };

        const fetchPickPercentages = async () => {
            try {
                const response = await fetch('/api/userPickPercentage');
                const data = await response.json();
                if (data.message === "There is not enough data") {
                    setPickPercentages({});
                } else {
                    const percentages: Record<string, { home: string; away: string }> = {};
                    data.data.forEach((game: any) => {
                        percentages[game.gameId] = {
                            home: game.homeTeamPercentage,
                            away: game.awayTeamPercentage
                        };
                    });
                    setPickPercentages(percentages);
                    console.log("Pick Percentages:", percentages);

                }
            } catch (error) {
                console.error("Error fetching pick percentages:", error);
            } finally {
                setLoadingPercentages(false);
            }
        };
        fetchTodayGames();
        fetchPickPercentages();
    }, []);

    useEffect(() => {
        console.log("Current state:", {
            isLocked,
            firstGameLocked,
            startedGames: Array.from(startedGames),
            selectedPicks: Array.from(selectedPicks),
            games: games.map(g => g.id)
        });
    }, [isLocked, firstGameLocked, startedGames, selectedPicks, games]);

    // This is the ONLY useEffect that should handle timing
    useEffect(() => {
        console.log("TIMER SETUP: Initializing single timer instance");
        
        // Function to update the countdown timer
        const updateCountdown = () => {
            const now = new Date();
            
            // If we have games, check if they've started
            if (games.length > 0) {
                // Sort games by start time
                const sortedGames = [...games].sort((a, b) => {
                    const timeA = new Date(`${new Date().toDateString()} ${a.gameTime}`);
                    const timeB = new Date(`${new Date().toDateString()} ${b.gameTime}`);
                    return timeA.getTime() - timeB.getTime();
                });
                
                // Get the first game
                const firstGame = sortedGames[0];
                
                // Check if any games have a status indicating they've started
                const anyGameStarted = games.some(game => 
                    game.status === "IN_PROGRESS" || 
                    game.status === "LIVE" || 
                    game.status === "STARTED" ||
                    game.status === "ACTIVE"
                );
                
                // If any game has started, force lock all games
                if (anyGameStarted) {
                    console.log("GAMES IN PROGRESS: Forcing lock on all games");
                    setFirstGameLocked(true);
                    setIsLocked(true);
                    setStartedGames(new Set(games.map(game => game.id)));
                    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                    return;
                }
                
                // Continue with normal timer logic for games that haven't started yet
                // Parse the game time (which is in ET)
                const [timeStr, period] = firstGame.gameTime.split(' ');
                const [hourStr, minuteStr] = timeStr.split(':');
                let etHours = parseInt(hourStr);
                
                // Convert ET time to 24-hour format
                if (period === 'PM' && etHours !== 12) etHours += 12;
                if (period === 'AM' && etHours === 12) etHours = 0;
                
                // Create a Date object for the game time in the user's local timezone
                const gameStartTime = new Date();
                
                // Account for timezone difference between ET and local time
                const etOffset = -4; // Assuming ET is UTC-4 (EDT)
                const localOffset = -now.getTimezoneOffset() / 60;
                const hourDifference = localOffset - etOffset;
                
                // Set the hours adjusted for timezone difference
                gameStartTime.setHours(etHours + hourDifference, parseInt(minuteStr), 0, 0);
                
                // If the calculated time is in the past, it's for tomorrow
                if (gameStartTime < now) {
                    gameStartTime.setDate(gameStartTime.getDate() + 1);
                }
                
                // Calculate time until game starts
                const timeDiff = gameStartTime.getTime() - now.getTime();
                
                // If game has started or timer is at 0
                if (timeDiff <= 0) {
                    // Lock the first game
                    setFirstGameLocked(true);
                    setStartedGames(prev => {
                        const newSet = new Set(prev);
                        newSet.add(firstGame.id);
                        return newSet;
                    });
                    
                    // Set time to 0
                    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                } else {
                    // Calculate remaining time
                    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                    
                    setTimeLeft({
                        hours,
                        minutes,
                        seconds
                    });
                }
            } else {
                // Default to midnight reset if no games
                const midnight = new Date(now);
                midnight.setHours(24, 0, 0, 0);
                
                const timeUntilMidnight = midnight.getTime() - now.getTime();
                const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
                const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeUntilMidnight % (1000 * 60)) / 1000);
                
                setTimeLeft({
                    hours,
                    minutes,
                    seconds
                });
            }
        };
        
        // Update immediately
        updateCountdown();
        
        // Set up interval
        const timerInterval = setInterval(updateCountdown, 1000);
        
        // Clean up
        return () => {
            clearInterval(timerInterval);
        };
    }, [games]);

    const handleTeamSelect = (gameId: string, teamType: 'home' | 'away') => {
        console.log(`Attempting to select ${teamType} team for game ${gameId}`);
        
        // Always allow selection for testing
        setSelectedPicks(prevPicks => {
            const newPicks = new Set(prevPicks);
            const pickId = `${gameId}-${teamType}`;
            const oppositePick = `${gameId}-${teamType === 'home' ? 'away' : 'home'}`;

            if (newPicks.has(pickId)) {
                console.log(`Removing pick: ${pickId}`);
                newPicks.delete(pickId);
            } else {
                console.log(`Adding pick: ${pickId}, removing opposite: ${oppositePick}`);
                newPicks.add(pickId);
                newPicks.delete(oppositePick);
            }
            return newPicks;
        });
    };

    const handleGetSpread = (gameId: string) => {
        console.log(`Fetching spread for ${gameId}`);
        const game = games.find(g => g.id === gameId);
        if (game) {
            setPreviewGame(game);
        }
    };

    const handleSubmitPicks = async () => {
        if (selectedPicks.size !== games.length) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const picksArray = Array.from(selectedPicks).map(pick => {
                const [gameId, teamType] = pick.split('-');
                const game = games.find(g => g.id === gameId);

                // Use the full date information from the game object, matching tomorrow-picks
                return {
                    gameId,
                    teamIndex: teamType === 'home' ? 0 : 1,
                    homeTeam: game?.homeTeam,
                    awayTeam: game?.awayTeam,
                    // Pass all date-related fields
                    fullDate: game?.fullDate,
                    dbDate: game?.dbDate,
                    dbTime: game?.dbTime,
                    estDate: game?.estDate,
                    gameTime: game?.gameTime,
                    status: game?.status
                };
            });

            const response = await fetch('/api/savePicks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    picks: picksArray,
                    pickDate: new Date().toISOString().split('T')[0] // Today's date for tracking purposes, matching tomorrow-picks
                }),
            });

            const resData = await response.json();

            if(resData.message === "Picks have already been made for today."){
                // Picks made already
                alert('You have already made your picks for today.');
                router.push('/daily-picks')
            } else if (response.ok) {
                /* for testing
                // Submitted picks, no previous picks from the day:

                // Check if user has leaderboard entry, if not create one
                const updateEntry = await fetch('api/leaderboard-entries/verifyEntry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clerk_id: userId, sport: 'NBA', week: getCurrentWeek() })
                });

                const data3 = await updateEntry.json();

                if (!updateEntry.ok) {
                    throw new Error(data3.message || 'Failed to update user entry in leaderboard');
                }

                // Update Max Points for User
                const max_points = MAXPOINTSPERGAME * picksArray.length + BONUSPOINTS;

                const updateMaxPoints = await fetch('/api/user/updateMaxPoints', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clerk_id: userId, max_points: max_points })
                });

                const data2 = await updateMaxPoints.json();

                if (!updateMaxPoints.ok) {
                    throw new Error(data2.message || 'Failed to update max points');
                }

                const updateUserPoints = await fetch('/api/leaderboard-entries/updateEntryPoints', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sport: 'NBA', week: getCurrentWeek() })
                });
                
                const data4 = await updateUserPoints.json();

                if(!updateUserPoints.ok) {
                    throw new Error(data4.message || 'Failed to update user total & entry points')
                }
                    */
            } else {
                // error in submitting picks
                throw new Error('Failed to submit picks');
            }   

            const percentageResponse = await fetch('/api/userPickPercentage');
            const data = await percentageResponse.json();

            if (data.message === "There is not enough data") {
                console.warn("Not enough user data to update percentages.");
            } else {
                for (const game of data.data) {
                    await fetch('/api/pusher', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            gameId: game.gameId,
                            homeTeamPercentage: game.homeTeamPercentage,
                            awayTeamPercentage: game.awayTeamPercentage
                        }),
                    });
                }
            }

            router.push('/myPicks');
        } catch (error) {
            console.error('Error submitting picks:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to submit picks');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAllGamesDone = useCallback(async () => {
        // Submitted picks, no previous picks from the day:
        try {
            // Extract picks from selectedPicks
            const picksArray = Array.from(selectedPicks).map(pick => {
                const [gameId, teamType] = pick.split('-');
                const game = games.find(g => g.id === gameId);
                return { gameId, teamType, game }; // Return structured pick info
            });
    
            // Check if user has leaderboard entry, if not create one
            const updateEntryResponse = await fetch('/api/leaderboard-entries/verifyEntry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerk_id: userId, sport: 'NBA', week: getCurrentWeek() }),
            });
    
            const updateEntryData = await updateEntryResponse.json();
            if (!updateEntryResponse.ok) {
                throw new Error(updateEntryData.message || 'Failed to update user entry in leaderboard');
            }
    
            // Update Max Points for User
            const maxPoints = MAXPOINTSPERGAME * picksArray.length + BONUSPOINTS;
    
            // Execute max points and leaderboard updates in parallel
            const [updateMaxPointsResponse, updateUserPointsResponse] = await Promise.all([
                fetch('/api/user/updateMaxPoints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clerk_id: userId, max_points: maxPoints }),
                }),
                fetch('/api/leaderboard-entries/updateEntryPoints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sport: 'NBA', week: getCurrentWeek() }),
                }),
            ]);
    
            const updateMaxPointsData = await updateMaxPointsResponse.json();
            if (!updateMaxPointsResponse.ok) {
                throw new Error(updateMaxPointsData.message || 'Failed to update max points');
            }
    
            const updateUserPointsData = await updateUserPointsResponse.json();
            if (!updateUserPointsResponse.ok) {
                throw new Error(updateUserPointsData.message || 'Failed to update user total & entry points');
            }
        } catch (error) {
            console.error('Error in handleAllGamesDone:', error instanceof Error ? error.message : 'Failed to submit picks');
        }
    }, [userId, selectedPicks, games]);

    useEffect(() => {
        if (allGamesEnded) {
            handleAllGamesDone();
        }
    }, [allGamesEnded, handleAllGamesDone]);

    // Add this function to check if a specific game is locked
    const isGameLocked = useCallback((gameId: string) => {
        // If all games are locked, this game is locked
        if (isLocked) return true;
        
        // If this specific game has started, it's locked
        return startedGames.has(gameId);
    }, [isLocked, startedGames]);

    // This function checks if a specific game should be locked based on its start time
    const shouldGameBeLocked = useCallback((gameTime: string) => {
        const now = new Date();
        
        // Parse the game time (in ET)
        const [timeStr, period] = gameTime.split(' ');
        const [hourStr, minuteStr] = timeStr.split(':');
        let etHours = parseInt(hourStr);
        
        // Convert to 24-hour format
        if (period === 'PM' && etHours !== 12) etHours += 12;
        if (period === 'AM' && etHours === 12) etHours = 0;
        
        // Create game time in user's local timezone
        const etOffset = -4; // ET is UTC-4 (EDT)
        const localOffset = -now.getTimezoneOffset() / 60;
        const hourDifference = localOffset - etOffset;
        
        const gameStartTime = new Date();
        gameStartTime.setHours(etHours + hourDifference, parseInt(minuteStr), 0, 0);
        
        // If game time is in the past for today, it has started
        return now >= gameStartTime;
    }, []);

    // Check game status on component mount and every minute
    useEffect(() => {
        // Function to check all games and lock as needed
        const checkGamesStatus = () => {
            if (games.length === 0) return;
            
            // Check each game
            let anyGameStarted = false;
            const newStartedGames = new Set<string>();
            
            games.forEach(game => {
                // Check if game has started based on time
                if (shouldGameBeLocked(game.gameTime)) {
                    anyGameStarted = true;
                    newStartedGames.add(game.id);
                }
            });
            
            // Update state based on checks
            if (anyGameStarted) {
                console.log("GAMES STARTED: Locking games", Array.from(newStartedGames));
                setFirstGameLocked(true);
                setIsLocked(true);
                setStartedGames(newStartedGames);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };
        
        // Call the function immediately on mount
        checkGamesStatus();
        
        // Set up interval to check every minute
        const intervalId = setInterval(checkGamesStatus, 60000);
        
        // Clean up on component unmount
        return () => {
            clearInterval(intervalId);
        };
    }, [games]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a]">
                <div className="bg-[#2a2a2a] p-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/myPicks')}
                            className="text-white hover:text-gray-300"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-white font-medium">Make picks</h1>
                    </div>
                    <div className="mt-4 inline-block">
                        <div className="bg-[#333] rounded-full px-4 py-2 text-sm">
                            <span className="text-white">Today&apos;s Games</span>
                            <span className="text-gray-400 ml-2">All times ET</span>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 p-2 text-center text-sm text-blue-600">
                    Spread finalized | Picks lock at the start of each game
                </div>
                <div className="p-4 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[#2a2a2a] rounded-lg shadow p-4 bg-gray-200">
                                <Skeleton className="h-6 w-1/2 bg-gray-300 mb-3" />
                                <div className="flex items-center gap-3 mb-3">
                                    <Skeleton className="w-12 h-12 bg-gray-300 rounded-full" />
                                    <Skeleton className="h-6 bg-gray-300 w-3/4" />
                                </div>
                                <div className="flex items-center gap-3 mb-4 mt-4">
                                    <Skeleton className="h-5 w-full bg-gray-300 rounded-full" />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Skeleton className="w-12 h-12 bg-gray-300 rounded-full" />
                                    <Skeleton className="h-6 w-3/4 bg-gray-300" />
                                </div>
                                <div className="flex items-center gap-3 mb-1 mt-1">
                                    <Skeleton className="h-6 w-3/4 bg-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-white">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a]">
            <div className="bg-[#2a2a2a] p-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/home')}
                        className="text-white hover:text-gray-300"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-medium">Home</h1>
                </div>
                <div className="mt-4 inline-block">
                    <div className="bg-[#333] rounded-full px-4 py-2 text-sm">
                        <span className="text-white">Today&apos;s Games</span>
                        <span className="text-gray-400 ml-2">All times ET</span>
                    </div>
                </div>
            </div>

            {/* Conditional display based on game status */}
            {!isLocked && (
                <div className="bg-blue-50 p-2 text-center text-sm">
                    <span className="text-blue-600">
                        Time until games start: {String(timeLeft.hours).padStart(2, '0')}:
                        {String(timeLeft.minutes).padStart(2, '0')}:
                        {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                </div>
            )}
            
            {isLocked && !allGamesEnded && (
                <div className="bg-red-50 p-2 text-center text-sm">
                    <span className="text-red-600 font-bold">
                        PICKS ARE LOCKED - GAMES HAVE STARTED
                    </span>
                </div>
            )}
            
            {allGamesEnded && (
                <div className="bg-green-50 p-2 text-center text-sm">
                    <span className="text-green-600">
                        Today&apos;s games have ended. Check back tomorrow!
                    </span>
                </div>
            )}

            {/* Enhanced Status Bar with more prominent lock indication */}
            <div className="text-center py-2 text-sm">
                <div className="text-gray-300">
                    Spread finalized | Picks lock: At the start of each game
                </div>
                {isLocked && (
                    <div className="py-3 mt-1 text-white bg-red-600 flex items-center justify-center font-bold text-lg animate-pulse">
                        GAMES LOCKED - REFRESH PAGE TO CONTINUE
                    </div>
                )}
                {firstGameLocked && !isLocked && (
                    <div className="py-3 mt-1 text-white bg-red-600 flex items-center justify-center font-bold text-lg animate-pulse">
                        FIRST GAME HAS STARTED - SOME PICKS ARE LOCKED
                    </div>
                )}
            </div>

            {/* Games Grid */}
            <div className="p-4 max-w-5xl mx-auto pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.length > 0 ? (
                        games.map((game) => {
                            const gameIsLocked = isGameLocked(game.id);
                            const awayPercentage = parseFloat(pickPercentages[game.id]?.away) || 0;
                            const homePercentage = parseFloat(pickPercentages[game.id]?.home) || 0;
                            const awayIsHigher = awayPercentage > homePercentage;
                            return (
                                <div key={game.id} className={`bg-white rounded-lg shadow border ${gameIsLocked ? 'border-red-200' : 'border-gray-200'}`}>
                                    <div className="flex justify-between items-center p-3 border-b">
                                        <div className="text-sm text-gray-500">
                                            <span>{game.gameTime} ET</span>
                                            <span className="mx-2">•</span>
                                            <span>
                                                {(() => {
                                                    const [time, period] = game.gameTime.split(' ');
                                                    const [hours, minutes] = time.split(':');
                                                    let etHours = parseInt(hours);
                                                    if (period === 'PM' && etHours !== 12) etHours += 12;
                                                    if (period === 'AM' && etHours === 12) etHours = 0;
                                                    const ptHours = (etHours - 3 + 24) % 24;
                                                    const ptPeriod = ptHours >= 12 ? 'PM' : 'AM';
                                                    const displayHours = ptHours > 12 ? ptHours - 12 : ptHours === 0 ? 12 : ptHours;
                                                    return `${displayHours}:${minutes} ${ptPeriod} PT`;
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            {gameIsLocked && (
                                                <span className="text-red-500 text-xs mr-2">LOCKED</span>
                                            )}
                                            <button
                                                onClick={() => handleGetSpread(game.id)}
                                                className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
                                            >
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <button
                                            onClick={() => handleTeamSelect(game.id, 'away')}
                                            disabled={gameIsLocked} // Disable when this specific game is locked
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border 
                                                    ${selectedPicks.has(`${game.id}-away`)
                                                    ? 'bg-blue-50 border-2 border-blue-500'
                                                    : 'border-gray-400 hover:bg-gray-200'
                                                }
                                                    ${gameIsLocked ? 'opacity-50 cursor-not-allowed' : ''} // Visually disable
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                    {game.awayTeam.logo ? (
                                                        <Image
                                                            src={game.awayTeam.logo}
                                                            alt={`${game.awayTeam.name} logo`}
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 rounded-full" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-black">{game.awayTeam.name}</span>
                                            </div>
                                            <span className={awayIsHigher ? "text-blue-400 font-semibold" : "text-gray-600"}>
                                                {loadingPercentages ? (
                                                    <Skeleton className="h-4 w-8" />
                                                ) : (
                                                    pickPercentages[game.id]?.away ?? 'N/A'
                                                )}
                                            </span>
                                        </button>

                                        {isMobile ? (
                                            (loadingPercentages) ? (
                                                // Show skeleton while loading or no data
                                                <div className="relative w-full h-4 bg-gray-300 rounded-lg overflow-hidden my-2">
                                                    <Skeleton className="absolute w-full h-full bg-gray-400 animate-pulse" />
                                                </div>
                                            ) : (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="relative w-full h-4 bg-gray-300 rounded-lg overflow-hidden my-2 cursor-pointer">
                                                            {awayPercentage === homePercentage && !gameIsLocked ? (
                                                                <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                            ) : (
                                                                <>
                                                                    {/* Away Team Progress */}
                                                                    <div
                                                                        className={`absolute left-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                    ${awayIsHigher ? 'bg-blue-400' : 'bg-gray-300'}`}
                                                                        style={{ width: `${awayPercentage}%` }}
                                                                    >
                                                                        {awayIsHigher && !gameIsLocked && (
                                                                            <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                                        )}
                                                                    </div>
                                                                    {/* Home Team Progress */}
                                                                    <div
                                                                        className={`absolute right-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                    ${homePercentage > awayPercentage ? 'bg-blue-400' : 'bg-gray-300'}`}
                                                                        style={{ width: `${homePercentage}%` }}
                                                                    >
                                                                        {homePercentage > awayPercentage && !gameIsLocked && (
                                                                            <div className="absolute top-0 left-0 w-full h-full animate-shimmer-right bg-white opacity-20"></div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </button>
                                                    </PopoverTrigger>

                                                    <PopoverContent side="top" align="center" className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-md w-65">
                                                        {pickPercentages[game.id]?.home === undefined || pickPercentages[game.id]?.away === undefined ? (
                                                            <p>Not enough user data to determine majority pick.</p> // If not enough data, show this message
                                                        ) : homePercentage === awayPercentage ? (
                                                            <p>Majority pick was split between both teams.</p>
                                                        ) : (
                                                            <p>Majority of users picked the {awayIsHigher ? game.awayTeam.name : game.homeTeam.name}.</p>
                                                        )}
                                                    </PopoverContent>
                                                </Popover>
                                            )
                                        ) : (
                                            <TooltipProvider delayDuration={0}>
                                                {pickPercentages[game.id] || pickPercentages[game.id]?.home === undefined ? ( // Ensure data is loaded before showing the tooltip
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="relative w-full h-4 bg-gray-300 rounded-lg overflow-hidden my-2 cursor-pointer">
                                                                {awayPercentage === homePercentage && !gameIsLocked ? (
                                                                    <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                                ) : (
                                                                    <>
                                                                        {/* Away Team Progress */}
                                                                        <div
                                                                            className={`absolute left-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                    ${awayIsHigher ? 'bg-blue-400' : 'bg-gray-300'}`}
                                                                            style={{ width: `${awayPercentage}%` }}
                                                                        >
                                                                            {awayIsHigher && !gameIsLocked && (
                                                                                <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                                            )}
                                                                        </div>
                                                                        {/* Home Team Progress */}
                                                                        <div
                                                                            className={`absolute right-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                    ${homePercentage > awayPercentage ? 'bg-blue-400' : 'bg-gray-300'}`}
                                                                            style={{ width: `${homePercentage}%` }}
                                                                        >
                                                                            {homePercentage > awayPercentage &&  !gameIsLocked && (
                                                                                <div className="absolute top-0 left-0 w-full h-full animate-shimmer-right bg-white opacity-20"></div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" align="center" className="pointer-events-none">
                                                            {pickPercentages[game.id]?.home === undefined || pickPercentages[game.id]?.away === undefined ? (
                                                                <p>Not enough user data to determine majority pick.</p> // If not enough data, show this message
                                                            ) : homePercentage === awayPercentage ? (
                                                                <p>Majority pick was split between both teams.</p>
                                                            ) : (
                                                                <p>Majority of users picked the {awayIsHigher ? game.awayTeam.name : game.homeTeam.name}.</p>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    // Show a placeholder (or just the progress bar) while loading
                                                    <div className="relative w-full h-4 bg-gray-300 rounded-lg overflow-hidden my-2">
                                                        <Skeleton className="absolute w-full h-full bg-gray-400 animate-pulse" />
                                                    </div>
                                                )}
                                            </TooltipProvider>
                                        )}

                                        <button
                                            onClick={() => handleTeamSelect(game.id, 'home')}
                                            disabled={gameIsLocked} // Disable when this specific game is locked
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border 
                                                ${gameIsLocked ? 'opacity-50 cursor-not-allowed' : ''} 
                                                ${selectedPicks.has(`${game.id}-home`)
                                                    ? 'bg-blue-50 border-2 border-blue-500'
                                                    : 'border-gray-400 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                    {game.homeTeam.logo ? (
                                                        <Image
                                                            src={game.homeTeam.logo}
                                                            alt={`${game.homeTeam.name} logo`}
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 rounded-full" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-black">{game.homeTeam.name}</span>
                                            </div>
                                            <span className={homePercentage > awayPercentage ? "text-blue-400 font-semibold" : "text-gray-600"}>
                                                {loadingPercentages ? (
                                                    <Skeleton className="h-4 w-8" />
                                                ) : (
                                                    pickPercentages[game.id]?.home ?? 'N/A'
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                    <div className="px-4 pb-3 flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Best pick</span>
                                        <button className="text-gray-400 hover:text-gray-600">★</button>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center gap-6 py-12 px-4">
                            <div className="text-white text-xl font-medium text-center">
                                No games scheduled for today
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push('/tomorrow-picks')}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    View Tomorrow&apos;s Games
                                </button>
                                <button
                                    onClick={() => router.push('/home')}
                                    className="px-6 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
                                >
                                    Back to Contests
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedPicks.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a] p-4 z-50 shadow-lg">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col items-center gap-2">
                            {submitError && (
                                <div className="text-red-500 text-sm mb-2">
                                    {submitError}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-white">
                                <span>{selectedPicks.size}/{games.length} picks made</span>
                            </div>
                            <div className="w-full flex gap-2">
                                {[...Array(games.length)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-1 rounded-full ${i < selectedPicks.size ? 'bg-blue-500' : 'bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            {selectedPicks.size === games.length && (
                                <button
                                    className={`w-full mt-3 py-3 rounded-lg font-medium transition-all ${submitting
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    disabled={submitting}
                                    onClick={handleSubmitPicks}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Picks'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {previewGame && (
                <OddsPreview
                    gameId={previewGame.id}
                    homeTeam={previewGame.homeTeam}
                    awayTeam={previewGame.awayTeam}
                    gameTime={previewGame.gameTime}
                    isOpen={!!previewGame}
                    onClose={() => setPreviewGame(null)}
                />
            )}
        </div>
    );
}