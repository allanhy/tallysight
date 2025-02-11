'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

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
    status: string;
    isAvailable: boolean;
}

export default function WeeklyPicksPage() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [games, setGames] = useState<Game[]>([]);
    const [selectedPicks, setSelectedPicks] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/nfl-odds');
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                const data = await response.json();
                setGames(data.games);
            } catch (error) {
                console.error('Error fetching games:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, []);

    const handlePickSelect = (gameId: string, teamName: string) => {
        setSelectedPicks(prev => ({
            ...prev,
            [gameId]: teamName
        }));
    };

    const handleSubmitPicks = async () => {
        try {
            const response = await fetch('/api/picks/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ picks: selectedPicks }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit picks');
            }

            // Optionally redirect or show success message
            alert('Picks submitted successfully!');
        } catch (error) {
            console.error('Error submitting picks:', error);
            alert('Failed to submit picks. Please try again.');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <button 
                onClick={() => router.push('/contests')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Contests
            </button>

            <div className="text-center mb-8">
                <div className="text-sm text-gray-400 mb-2">Spread finalized | Picks lock: At the start of each game</div>
                <div className="bg-blue-600 text-white py-3 px-4 rounded">
                    Make your picks
                </div>
            </div>

            <div className="space-y-2">
                {games.map((game) => (
                    <div key={game.id} className="bg-gray-900 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-gray-400 text-sm">
                                {new Date(game.date).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    timeZoneName: 'short'
                                })}
                            </div>
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                                Preview
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src={game.team1.logo} alt={game.team1.name} className="w-6 h-6" />
                                    <span className="text-white text-sm">{game.team1.name}</span>
                                    <span className="text-gray-400 text-sm">{game.team1.spread}</span>
                                </div>
                                <button 
                                    className={`w-6 h-6 rounded-full border-2 transition-colors ${
                                        selectedPicks[game.id] === game.team1.name 
                                        ? 'bg-blue-500 border-blue-500' 
                                        : 'border-gray-600 hover:border-blue-500'
                                    }`}
                                    onClick={() => handlePickSelect(game.id, game.team1.name)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src={game.team2.logo} alt={game.team2.name} className="w-6 h-6" />
                                    <span className="text-white text-sm">{game.team2.name}</span>
                                    <span className="text-gray-400 text-sm">{game.team2.spread}</span>
                                </div>
                                <button 
                                    className={`w-6 h-6 rounded-full border-2 transition-colors ${
                                        selectedPicks[game.id] === game.team2.name 
                                        ? 'bg-blue-500 border-blue-500' 
                                        : 'border-gray-600 hover:border-blue-500'
                                    }`}
                                    onClick={() => handlePickSelect(game.id, game.team2.name)}
                                />
                            </div>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Best pick</span>
                            <button className="text-gray-400 hover:text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit button - only show if picks are made */}
            {Object.keys(selectedPicks).length > 0 && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center">
                    <button
                        onClick={handleSubmitPicks}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
                    >
                        Submit Picks ({Object.keys(selectedPicks).length})
                    </button>
                </div>
            )}
        </div>
    );
} 