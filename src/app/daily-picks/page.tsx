'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
}

export default function DailyPicks() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());

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
                
                // Safely filter today's games
                const todayGames = data.games?.filter((game: Game) => {
                    try {
                        if (!game.gameTime) return false;
                        
                        // Get today's date in EST
                        const now = new Date();
                        const estNow = new Date(now.toLocaleString('en-US', {
                            timeZone: 'America/New_York'
                        }));
                        const todayDate = estNow.toLocaleDateString();

                        // Get game date in EST
                        const gameDate = new Date(game.gameTime);
                        const estGameDate = new Date(gameDate.toLocaleString('en-US', {
                            timeZone: 'America/New_York'
                        }));
                        const gameDateStr = estGameDate.toLocaleDateString();

                        // Compare dates
                        return todayDate === gameDateStr;
                    } catch (e) {
                        console.error('Error processing game date:', e);
                        return false;
                    }
                }) || [];

                setGames(todayGames);
            } catch (error) {
                console.error('Error fetching games:', error);
                setError('Failed to load today\'s games');
            } finally {
                setLoading(false);
            }
        };

        fetchTodayGames();
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-white">Loading today's games...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a]">
            {/* Header */}
            <div className="bg-[#2a2a2a] p-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/contests')}
                        className="text-white hover:text-gray-300"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-white font-medium">Make picks</h1>
                </div>
                <div className="mt-4 inline-block">
                    <div className="bg-[#333] rounded-full px-4 py-2 text-sm">
                        <span className="text-white">Today's Games</span>
                        <span className="text-gray-400 ml-2">All times ET</span>
                    </div>
                </div>
            </div>

            {/* Info Bar */}
            <div className="bg-blue-50 p-2 text-center text-sm text-blue-600">
                Spread finalized | Picks lock at the start of each game
            </div>

            {/* Games Grid */}
            <div className="p-4 max-w-5xl mx-auto">
                {games.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-white text-xl font-medium mb-2">No Games Today</div>
                        <p className="text-gray-400">Check back tomorrow for new games!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {games.map((game) => (
                            <div key={game.id} className="bg-white rounded-lg shadow">
                                {/* Game Time */}
                                <div className="flex justify-between items-center p-3 border-b">
                                    <span className="text-sm text-gray-500">{game.gameTime}</span>
                                    <button className="text-blue-500 text-sm">Preview</button>
                                </div>

                                {/* Teams */}
                                <div className="p-4 space-y-3">
                                    {/* Away Team */}
                                    <button 
                                        onClick={() => handleTeamSelect(game.id, 'away')}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                            selectedPicks.has(`${game.id}-away`)
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                            <span className="font-medium">{game.awayTeam.name}</span>
                                        </div>
                                        <span className="text-gray-700">{game.awayTeam.spread}</span>
                                    </button>

                                    {/* Home Team */}
                                    <button 
                                        onClick={() => handleTeamSelect(game.id, 'home')}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                            selectedPicks.has(`${game.id}-home`)
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                            <span className="font-medium">{game.homeTeam.name}</span>
                                        </div>
                                        <span className="text-gray-700">{game.homeTeam.spread}</span>
                                    </button>
                                </div>

                                {/* Best Pick */}
                                <div className="px-4 pb-3 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Best pick</span>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        ★
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Progress Footer */}
            {selectedPicks.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#2a2a2a] p-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-white">
                                <span>{selectedPicks.size}/5 picks made</span>
                            </div>
                            <div className="w-full flex gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-1 rounded-full ${
                                            i < selectedPicks.size ? 'bg-blue-500' : 'bg-gray-600'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}