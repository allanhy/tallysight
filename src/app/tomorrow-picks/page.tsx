'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Team {
    name: string;
    score: number | null;
    spread: string;
}

interface Game {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    gameTime: string;
    status: string;
}

export default function TomorrowPicks() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const fetchGames = async () => {
            try {
                const response = await fetch('/api/nba-games?day=tomorrow');
                if (!response.ok) {
                    throw new Error('Failed to fetch games');
                }
                const data = await response.json();
                setGames(data);
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [mounted]);

    const handleTeamSelect = (gameId: string, teamType: 'home' | 'away') => {
        const newPicks = new Set(selectedPicks);
        const pickId = `${gameId}-${teamType}`;
        const oppositePick = `${gameId}-${teamType === 'home' ? 'away' : 'home'}`;

        if (newPicks.has(pickId)) {
            newPicks.delete(pickId);
        } else {
            newPicks.add(pickId);
            newPicks.delete(oppositePick);
        }
        setSelectedPicks(newPicks);
    };

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
                        <span className="text-white">Tomorrow's Games</span>
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
                    {games.map((game) => (
                        <div key={game.id} className="bg-white rounded-lg shadow">
                            <div className="flex justify-between items-center p-3 border-b">
                                <span className="text-sm text-gray-500">{game.gameTime}</span>
                                <button className="text-blue-500 text-sm">Preview</button>
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
                                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                        <span className="font-medium">{game.awayTeam.name}</span>
                                    </div>
                                    <span className="text-gray-700">{game.awayTeam.spread}</span>
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
                                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                        <span className="font-medium">{game.homeTeam.name}</span>
                                    </div>
                                    <span className="text-gray-700">{game.homeTeam.spread}</span>
                                </button>
                            </div>
                            <div className="px-4 pb-3 flex justify-between items-center">
                                <span className="text-sm text-gray-500">Best pick</span>
                                <button className="text-gray-400 hover:text-gray-600">★</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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