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

export default function DailyPicks() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

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
                console.log('Received games:', data.games); // Debug log
                setGames(data.games);
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

    const handleGetSpread = (gameId: string, teamType: 'home' | 'away') => {
        console.log(`Fetching spread for ${gameId} ${teamType} team`);
    };

    const handleSubmitPicks = async () => {
        if (selectedPicks.size !== games.length) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const picksArray = Array.from(selectedPicks).map(pick => {
                const [gameId, teamType] = pick.split('-');
                const game = games.find(g => g.id === gameId);
                
                return {
                    gameId,
                    teamIndex: teamType === 'home' ? 0 : 1,
                    homeTeam: game?.homeTeam,
                    awayTeam: game?.awayTeam,
                    gameTime: game?.gameTime
                };
            });

            // Get today's date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const response = await fetch('/api/savePicks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    picks: picksArray,
                    pickDate: today.toISOString()
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit picks');
            }

            router.push('/contests');
        } catch (error) {
            console.error('Error submitting picks:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to submit picks');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-white">Loading today's games...</div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.length > 0 ? (
                        games.map((game) => (
                            <div key={game.id} className="bg-white rounded-lg shadow">
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
                                        onClick={() => handleGetSpread(game.id, 'home')}
                                        className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
                                    >
                                        Preview
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    <button 
                                        onClick={() => handleTeamSelect(game.id, 'away')}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                            selectedPicks.has(`${game.id}-away`)
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : 'hover:bg-gray-50'
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
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 rounded-full" />
                                                )}
                                            </div>
                                            <span className="font-medium">{game.awayTeam.name}</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => handleTeamSelect(game.id, 'home')}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                            selectedPicks.has(`${game.id}-home`)
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : 'hover:bg-gray-50'
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
                                            <span className="font-medium">{game.homeTeam.name}</span>
                                        </div>
                                    </button>
                                </div>
                                <div className="px-4 pb-3 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Best pick</span>
                                    <button className="text-gray-400 hover:text-gray-600">★</button>
                                </div>
                            </div>
                        ))
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
                                    View Tomorrow's Games
                                </button>
                                <button
                                    onClick={() => router.push('/contests')}
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
                                        className={`flex-1 h-1 rounded-full ${
                                            i < selectedPicks.size ? 'bg-blue-500' : 'bg-gray-600'
                                        }`}
                                    />
                                ))}
                            </div>
                            {selectedPicks.size === games.length && (
                                <button
                                    className={`w-full mt-3 py-3 rounded-lg font-medium transition-all ${
                                        submitting
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
        </div>
    );
}