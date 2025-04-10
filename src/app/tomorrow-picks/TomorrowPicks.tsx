/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "../components/ui/dialog";
import { X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import AuthDialog from '../components/AuthDialog';

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

type BestPickButtonProps = {
    gameId: string;
    isSelected: boolean;
}

const MAXPOINTSPERGAME = 1;
const BONUSPOINTS = 3;
const BESTPICKPOINTS = 3;

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

export default function TomorrowPicks() {
    const router = useRouter();
    const { userId } = useAuth();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());
    const [bestPick, setBestPick] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [pickPercentages, setPickPercentages] = useState<Record<string, { home: string; away: string }>>({});
    const [loadingPercentages, setLoadingPercentages] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [previewGame, setPreviewGame] = useState<Game | null>(null);
    const searchParams = useSearchParams();
    const selectedSport = searchParams.get('sport') || 'NBA';
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    const spreads = games.map(game => [game.homeTeam.spread, game.awayTeam.spread]).flat();
    const totalSpreads = spreads.length;
    const spreadsAvailable = spreads.filter(s => s !== 'TBD' && s !== 'N/A').length;

    let spreadStatus = "Picks lock at the start of each game";

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

    useEffect(() => {
        const fetchTomorrowGames = async () => {
            try {
                const response = await fetch(`/api/all-espn-games?sport=${selectedSport.toLowerCase()}&day=tomorrow`, {
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
                console.log('Received games:', data.games); // Debug log

                setGames(data.games);

                if (data.games && data.games.length > 0) {
                    fetchPreviousPicks(data.games);
                }
            } catch (error) {
                console.error('Error fetching games:', error);
                setError('Failed to load tomorrow\'s games');
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

        // Sets selected picks as previous picks if a user is redo-ing their picks
        const fetchPreviousPicks = async (tomorrowGames: any[]) => {
            try {
                // Check if user is authenticated
                if (!userId) {
                    console.warn('No user ID available, skipping previous picks fetch');
                    return;
                }

                const response = await fetch('/api/userPicks', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Handle different response statuses
                if (response.status === 404) {
                    // No picks found - this is a valid state
                    return;
                }

                if (response.status === 401) {
                    console.warn('User not authorized to fetch picks');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Failed to fetch user picks: ${response.statusText}`);
                }

                const picks = await response.json();

                // If picks is empty or not an array, return early
                if (!Array.isArray(picks) || picks.length === 0) {
                    return;
                }

                // Create a Set of tomorrow's game IDs for quick lookup
                const tomorrowGameIds = new Set(tomorrowGames.map(game => game.id));

                // Initialize selectedPicks only with picks that match tomorrow's games
                const initialSelectedPicks = new Set<string>();

                picks.forEach((pick: any) => {
                    // Only process picks for tomorrow's games
                    if (tomorrowGameIds.has(pick.gameId)) {
                        // Convert the API data to the format used in selectedPicks
                        const teamType = pick.teamIndex === 0 ? 'home' : 'away';
                        initialSelectedPicks.add(`${pick.gameId}-${teamType}`);
                    }
                });

                // Set the selectedPicks state with users previous picks
                setSelectedPicks(initialSelectedPicks);
            } catch (error) {
                // Log the error but don't throw it - this allows the app to continue
                console.error('Error fetching previous picks:', error);
                // Optionally set an error state that can be displayed to the user
                setError('Unable to load previous picks. You can still make new picks.');
            }
        };

        fetchTomorrowGames();
        fetchPickPercentages();
    }, []);

    const handleTeamSelect = (gameId: string, teamType: 'home' | 'away') => {
        setSelectedPicks(prevPicks => {
            const newPicks = new Set(prevPicks);
            const pickId = `${gameId}-${teamType}`;
            const oppositePick = `${gameId}-${teamType === 'home' ? 'away' : 'home'}`;

            if (newPicks.has(pickId)) {
                newPicks.delete(pickId);
            } else {
                newPicks.add(pickId);
                newPicks.delete(oppositePick);
            }
            return newPicks;
        });
    };

    // Setting the best pick for more points
    const handleBestPickSelect = (gameId: string) => {
        setBestPick(prevBestPick => prevBestPick === gameId ? null : gameId); // Can select and unselect
    };

    const BestPickButton: React.FC<BestPickButtonProps> = ({ gameId, isSelected }) => (
        <div>
            <button
                onClick={() => handleBestPickSelect(gameId)}
                className={`text-gray-400 hover:text-gray-600 ${isSelected ? "font-medium text-yellow-500" : ""}`}>
                Best Pick ★
            </button>
        </div>
    );

    const handleGetSpread = (gameId: string) => {
        console.log(`Fetching spread for ${gameId}`);
        const game = games.find(g => g.id === gameId);
        if (game) {
            setPreviewGame(game);
        }
    };

    if (spreadsAvailable === totalSpreads && totalSpreads > 0) {
        spreadStatus = "Spread finalized | Picks lock at the start of each game";
    } else if (spreadsAvailable > 0) {
        spreadStatus = "Spread available | Picks lock at the start of each game";
    }

    const handleSubmitPicks = async () => {
        if (!userId) {
            setShowAuthDialog(true);
            return;
        }

        if (selectedPicks.size !== games.length) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const picksArray = Array.from(selectedPicks).map(pick => {
                const [gameId, teamType] = pick.split('-');
                const game = games.find(g => g.id === gameId);

                // Use the full date information from the game object
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
                    bestPick: gameId === bestPick,
                    sport: selectedSport.toUpperCase()
                };
            });

            const response = await fetch('/api/savePicks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    picks: picksArray,
                    pickDate: new Date().toISOString().split('T')[0] // Today's date for tracking purposes
                }),
            });

            if (!response.ok) {
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

            router.push(`/myPicks?sport=${selectedSport}`);
        } catch (error) {
            console.error('Error submitting picks:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to submit picks');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a]">
                <div className="bg-[#2a2a2a] p-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/contests')}
                            className="text-white hover:text-gray-300"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-white font-medium">Home</h1>
                    </div>
                    <div className="mt-4 inline-block">
                        <div className="bg-[#333] rounded-full px-4 py-2 text-sm">
                            <span className="text-white">Tomorrow&apos;s {selectedSport} Games</span>
                            <span className="text-gray-400 ml-2">All times ET</span>
                        </div>
                    </div>
                </div>
                <div className="accent-bg-light p-2 text-center text-sm text-accent">
                    Picks lock at the start of each game
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
                        <span className="text-white">Tomorrow&apos;s {selectedSport} Games</span>
                        <span className="text-gray-400 ml-2">All times ET</span>
                    </div>
                </div>
            </div>

            {/* Info Bar */}
            <div className="accent-bg-light p-2 text-center text-sm text-accent">
                {spreadStatus}
            </div>

            {/* Games Grid */}
            <div className="p-4 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.length > 0 ? (
                        games.map((game) => {
                            const awayPercentage = parseFloat(pickPercentages[game.id]?.away) || 0;
                            const homePercentage = parseFloat(pickPercentages[game.id]?.home) || 0;
                            const awayIsHigher = awayPercentage > homePercentage;
                            return (
                                <div key={game.id} className="bg-white rounded-lg shadow border border-gray-200">
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
                                        <button
                                            onClick={() => handleGetSpread(game.id)}
                                            className="accent-text text-sm transition-colors"
                                        >
                                            Preview
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <button
                                            onClick={() => handleTeamSelect(game.id, 'away')}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border ${selectedPicks.has(`${game.id}-away`)
                                                ? 'accent-bg-light border-2 accent-border'
                                                : 'border-gray-400 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                    {game.awayTeam.logo ? (
                                                        <Image
                                                            src={game.awayTeam.logo}
                                                            alt={`${game.awayTeam.name} logo`}
                                                            fill
                                                            className="object-contain"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 rounded-full" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-black">{game.awayTeam.name}</span>
                                            </div>
                                            <span className={awayIsHigher ? "text-accent font-semibold" : "text-gray-600"}>
                                                {loadingPercentages ? (
                                                    <Skeleton className="h-4 w-8" />
                                                ) : (
                                                    pickPercentages[game.id]?.away ?? 'N/A'
                                                )}
                                            </span>
                                        </button>

                                        {isMobile ? (
                                            (pickPercentages[game.id] || pickPercentages[game.id]?.home === undefined) ? (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className="relative w-full h-4 bg-gray-300 rounded-lg overflow-hidden my-2 cursor-pointer">
                                                            {awayPercentage === homePercentage ? (
                                                                <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                            ) : (
                                                                <>
                                                                    {/* Away Team Progress */}
                                                                    <div
                                                                        className={`absolute left-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                        ${awayIsHigher ? 'accent-bg' : 'bg-gray-300'}`}
                                                                        style={{ width: `${awayPercentage}%` }}
                                                                    >
                                                                        {awayIsHigher && (
                                                                            <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                                        )}
                                                                    </div>
                                                                    {/* Home Team Progress */}
                                                                    <div
                                                                        className={`absolute right-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                        ${homePercentage > awayPercentage ? 'accent-bg' : 'bg-gray-300'}`}
                                                                        style={{ width: `${homePercentage}%` }}
                                                                    >
                                                                        {homePercentage > awayPercentage && (
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
                                            ) : (
                                                // Show skeleton while loading or no data
                                                <div className="relative w-full h-4 bg-gray-300 rounded-lg overflow-hidden my-2">
                                                    <Skeleton className="absolute w-full h-full bg-gray-400 animate-pulse" />
                                                </div>
                                            )
                                        ) : (
                                            <TooltipProvider delayDuration={0}>
                                                {pickPercentages[game.id] || pickPercentages[game.id]?.home === undefined ? ( // Ensure data is loaded before showing the tooltip
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="relative w-full h-4 bg-gray-300 rounded-lg overflow-hidden my-2 cursor-pointer">
                                                                {awayPercentage === homePercentage ? (
                                                                    <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                                ) : (
                                                                    <>
                                                                        {/* Away Team Progress */}
                                                                        <div
                                                                            className={`absolute left-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                            ${awayIsHigher ? 'accent-bg' : 'bg-gray-300'}`}
                                                                            style={{ width: `${awayPercentage}%` }}
                                                                        >
                                                                            {awayIsHigher && (
                                                                                <div className="absolute top-0 left-0 w-full h-full animate-shimmer-left bg-white opacity-20"></div>
                                                                            )}
                                                                        </div>
                                                                        {/* Home Team Progress */}
                                                                        <div
                                                                            className={`absolute right-0 top-0 h-full transition-all duration-500 ease-in-out overflow-hidden 
                                                                            ${homePercentage > awayPercentage ? 'accent-bg' : 'bg-gray-300'}`}
                                                                            style={{ width: `${homePercentage}%` }}
                                                                        >
                                                                            {homePercentage > awayPercentage && (
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
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border ${selectedPicks.has(`${game.id}-home`)
                                                ? 'accent-bg-light border-2 accent-border'
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
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 rounded-full" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-black">{game.homeTeam.name}</span>
                                            </div>
                                            <span className={homePercentage > awayPercentage ? "text-accent font-semibold" : "text-gray-600"}>
                                                {loadingPercentages ? (
                                                    <Skeleton className="h-4 w-8" />
                                                ) : (
                                                    pickPercentages[game.id]?.home ?? 'N/A'
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                    <div className="px-4 pb-3 flex justify-between items-center">
                                        <BestPickButton
                                            gameId={game.id}
                                            isSelected={bestPick === game.id} />
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center gap-6 py-12 px-4">
                            <div className="text-white text-xl font-medium text-center">
                                No games scheduled for tomorrow
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push(`/daily-picks?sport=${selectedSport}`)}
                                    className="px-6 py-3 accent-button text-white rounded-lg transition-colors"
                                >
                                    View Today&apos;s Games
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
                <div className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a] p-4">
                    <div className="max-w-5xl mx-auto">
                        {submitError && (
                            <div className="text-red-500 text-sm mb-2">
                                {submitError}
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-white">
                                <span>{selectedPicks.size}/{games.length} picks made</span>
                                <span className="px-10">
                                    <strong>Total Points Possible:</strong> {selectedPicks.size * MAXPOINTSPERGAME}
                                    {selectedPicks.size === games.length && ` + ${BONUSPOINTS}`}
                                    {bestPick && ` + ${BESTPICKPOINTS}`}

                                    {/* Showing total only when all picks made or has best pick */}
                                    {(selectedPicks.size === games.length || bestPick) && " = "}

                                    {(selectedPicks.size === games.length || bestPick) && (
                                        <>
                                            {selectedPicks.size * MAXPOINTSPERGAME +
                                                (selectedPicks.size === games.length ? BONUSPOINTS : 0) +
                                                (bestPick ? BESTPICKPOINTS : 0)}
                                            <br />
                                            {"("}
                                            {selectedPicks.size === games.length && (
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-pointer">
                                                                Bonus Points: {BONUSPOINTS}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" align="center" className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-md w-65">
                                                            Points for winning all picks.
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                            {" "}
                                            {bestPick && (
                                                <>
                                                    {selectedPicks.size === games.length && " "}
                                                    <TooltipProvider delayDuration={0}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-pointer">
                                                                    Best Pick Points: {BESTPICKPOINTS}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" align="center" className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-md w-65">
                                                                Points for winning your best pick.
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </>
                                            )}
                                            {")"}
                                        </>
                                    )}
                                </span>
                            </div>
                            <div className="w-full flex gap-2">
                                {[...Array(games.length)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-1 rounded-full ${i < selectedPicks.size ? 'accent-bg' : 'bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            {selectedPicks.size === games.length && (
                                <button
                                    className={`w-full mt-3 py-3 rounded-lg font-medium transition-all ${submitting
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'accent-button text-white'
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
                <Dialog open={!!previewGame} onOpenChange={(open) => !open && setPreviewGame(null)}>
                    <DialogContent className="bg-white p-0 max-w-md mx-auto">
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle className="text-black">Game Preview</DialogTitle>
                            <DialogClose className="absolute right-4 top-3">
                                <X className="h-4 w-4 text-black" />
                            </DialogClose>
                        </DialogHeader>
                        <div className="p-0">
                            <OddsPreview
                                gameId={previewGame.id}
                                homeTeam={previewGame.homeTeam}
                                awayTeam={previewGame.awayTeam}
                                gameTime={previewGame.gameTime}
                                isOpen={!!previewGame}
                                day="tomorrow"
                                onClose={() => setPreviewGame(null)}
                                sport={selectedSport}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <AuthDialog
                isOpen={showAuthDialog}
                onClose={() => setShowAuthDialog(false)}
            />
        </div>
    );
} 