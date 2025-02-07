'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

interface Team {
    name: string;
    spread: string;
    logo: string;
}

interface Game {
    id: string;
    date: string;
    team1: Team;
    team2: Team;
    venue?: string;
    broadcast?: string;
    status: string;
    isAvailable?: boolean;
}

export default function DailyPicksPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set());
    const [starredPicks, setStarredPicks] = useState<Set<string>>(new Set());
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewedGame, setPreviewedGame] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { isSignedIn } = useUser();

    const fetchGames = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/odds');
            
            if (!response.data.games) {
                throw new Error('Invalid response format from API');
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const todaysGames = response.data.games.filter((game: Game) => {
                const gameDate = new Date(game.date);
                return gameDate >= today && gameDate < tomorrow;
            });
            
            setGames(todaysGames);
        } catch (error) {
            console.error('Error fetching games:', error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.error || error.message);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTeamSelection = (gameId: string, teamIndex: number) => {
        const newPicks = new Set(selectedPicks);
        const pickId = `${gameId}-${teamIndex}`;
        const opposingPickId = `${gameId}-${teamIndex === 0 ? 1 : 0}`;

        if (newPicks.has(pickId)) {
            newPicks.delete(pickId);
        } else {
            newPicks.add(pickId);
            newPicks.delete(opposingPickId);
        }
        setSelectedPicks(newPicks);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white text-center flex flex-col px-14 py-8">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white text-center flex flex-col px-14 py-8">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col px-14 py-8">
            {/* Header */}
            <div className="mb-8">
                <button 
                    onClick={() => router.back()} 
                    className="text-gray-400 hover:text-white mb-4"
                >
                    ← Back to Contests
                </button>
                <h1 className="text-3xl font-bold">NBA Daily Picks</h1>
                <p className="text-gray-400 mt-2">Make your picks for today's NBA games</p>
            </div>

            {/* Status Bar */}
            <div className="text-center py-2 text-sm mb-8">
                <div className="text-gray-300">Spread finalized | Picks lock: At the start of each game</div>
                <div className="bg-blue-600 py-2 mt-1 text-white">Make your picks</div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <div key={game.id} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow border border-gray-700">
                        {/* Game Header */}
                        <div className="flex justify-between p-4">
                            <span className="text-gray-300">
                                {new Date(game.date).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    timeZoneName: 'short'
                                })}
                            </span>
                            <button 
                                className="text-blue-400 hover:text-blue-300"
                                onClick={() => { setPreviewedGame(game); setIsPreviewOpen(true); }}
                            >
                                Preview
                            </button>
                        </div>

                        {/* Teams */}
                        {[game.team1, game.team2].map((team, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleTeamSelection(game.id, idx)}
                                className={`w-full p-4 flex items-center justify-between border-2 ${
                                    selectedPicks.has(`${game.id}-${idx}`)
                                        ? 'border-blue-500 rounded-lg'
                                        : 'border-transparent'
                                } hover:bg-gray-700/50 transition-colors`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full">
                                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover rounded-full" />
                                    </div>
                                    <span className="text-white">{team.name}</span>
                                    <span className="text-gray-300">{team.spread}</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 ${
                                    selectedPicks.has(`${game.id}-${idx}`)
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-gray-500'
                                }`} />
                            </button>
                        ))}

                        {/* Best Pick */}
                        <div className="border-t border-gray-700 flex justify-between p-4">
                            <span className="text-gray-300">Best pick</span>
                            <button 
                                onClick={() => {
                                    const newStarred = new Set(starredPicks);
                                    if (newStarred.has(game.id)) {
                                        newStarred.delete(game.id);
                                    } else {
                                        newStarred.add(game.id);
                                    }
                                    setStarredPicks(newStarred);
                                }}
                                className="text-2xl"
                            >
                                {starredPicks.has(game.id) ? '⭐' : '☆'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {isPreviewOpen && previewedGame && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-xl w-11/12 max-w-lg shadow-2xl border border-gray-700">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">Game Preview</h2>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="flex items-start justify-between mb-10">
                            {/* Team 1 */}
                            <div className="text-center w-1/3">
                                <img
                                    src={previewedGame.team1.logo}
                                    alt={previewedGame.team1.name}
                                    className="w-28 h-28 mx-auto mb-8 rounded-full"
                                />
                                <h3 className="font-bold text-lg mb-8 text-white">{previewedGame.team1.name}</h3>
                                <p className="text-2xl font-bold text-blue-600 mb-8">{previewedGame.team1.spread}</p>
                            </div>

                            {/* VS */}
                            <div className="text-center w-1/3 pt-36">
                                <p className="font-bold text-xl mb-12 text-white">vs</p>
                            </div>

                            {/* Team 2 */}
                            <div className="text-center w-1/3">
                                <img
                                    src={previewedGame.team2.logo}
                                    alt={previewedGame.team2.name}
                                    className="w-28 h-28 mx-auto mb-8 rounded-full"
                                />
                                <h3 className="font-bold text-lg mb-8 text-white">{previewedGame.team2.name}</h3>
                                <p className="text-2xl font-bold text-red-600 mb-8">{previewedGame.team2.spread}</p>
                            </div>
                        </div>

                        {/* Game Details */}
                        <div className="space-y-2 text-sm">
                            <div className="flex">
                                <span className="w-24 font-semibold text-white">Date:</span>
                                <span className="text-gray-300">
                                    {new Date(previewedGame.date).toLocaleString()}
                                </span>
                            </div>
                            {previewedGame.venue && (
                                <div className="flex">
                                    <span className="w-24 font-semibold text-white">Venue:</span>
                                    <span className="text-gray-300">{previewedGame.venue}</span>
                                </div>
                            )}
                            {previewedGame.broadcast && (
                                <div className="flex">
                                    <span className="w-24 font-semibold text-white">Broadcast:</span>
                                    <span className="text-gray-300">{previewedGame.broadcast}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg border-t border-gray-700 p-4">
                <div className="max-w-7xl mx-auto px-4">
                    <button 
                        onClick={() => {/* Handle submission */}}
                        disabled={selectedPicks.size === 0}
                        className={`w-full py-3 rounded-lg font-bold transition-colors ${
                            selectedPicks.size === 0
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        Submit Picks ({selectedPicks.size})
                    </button>
                </div>
            </div>
        </div>
    );
}
