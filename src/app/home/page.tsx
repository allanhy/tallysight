'use client';

import React, { useState, useEffect } from 'react';
import 'react-multi-carousel/lib/styles.css';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../components/ui/skeleton';
import UserMatch from '../components/UserMatch';

interface Game {
    id: string;
    homeTeam: {
        name: string;
        score: number | null;
        spread: string;
    };
    awayTeam: {
        name: string;
        score: number | null;
        spread: string;
    };
    gameTime: string;
    status: string;
}

export default function Home() {
    const router = useRouter();
    const [todayGames, setTodayGames] = useState<Game[]>([]);
    const [tomorrowGames, setTomorrowGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                // Fetch today's games
                const todayResponse = await fetch('/api/nba-games?day=today');
                const todayData = await todayResponse.json();
                setTodayGames(todayData.games);

                // Fetch tomorrow's games
                const tomorrowResponse = await fetch('/api/nba-games?day=tomorrow');
                const tomorrowData = await tomorrowResponse.json();
                setTomorrowGames(tomorrowData.games);
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-8 min-h-screen">
                <UserMatch/>
                <h1 className="text-black dark:text-white font-semibold mb-4 text-center" style={{ letterSpacing: '1.5px', fontSize: '65px' }}>
                    Contests
                </h1>
                <div className="flex flex-col gap-4 sm:gap-8 max-w-4xl mx-auto">
                    {/* Skeleton for Featured Contest */}
                    <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-gray-900 p-4 sm:p-8">
                        <Skeleton className="h-5 w-1/4 bg-gray-600 mb-2" />
                        <Skeleton className="h-8 w-3/4 bg-gray-500 mb-2" />
                        <Skeleton className="h-4 w-1/2 bg-gray-600 mb-4" />
                        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
                    </div>

                    {/* Skeleton for Upcoming Contest */}
                    <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-gray-900 p-4 sm:p-8">
                        <Skeleton className="h-5 w-1/4 bg-gray-600 mb-2" />
                        <Skeleton className="h-8 w-3/4 bg-gray-500 mb-2" />
                        <Skeleton className="h-4 w-1/2 bg-gray-600 mb-4" />
                        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 min-h-screen" >
        <h1 className="text-black dark:text-white font-semibold mb-4 text-center" style={{ letterSpacing: '1.5px', fontSize: '65px' }}
        >Contests</h1>
        <div className="flex flex-col gap-4 sm:gap-8 max-w-4xl mx-auto">
            <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden" style={{ background: 'linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0))' }}>
                <div className="p-4 sm:p-8">
                    <div className="uppercase tracking-wide text-sm text-white font-semibold">
                        Featured Contest
                    </div>
                    <h1 className="block mt-1 text-lg leading-tight font-medium text-white">
                        Today&apos;s NBA Games ({todayGames.length} games)
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Make your picks for today&apos;s NBA matchups!
                    </p>
                    <button
                        onClick={() => router.push('/daily-picks')}
                        className="mt-4 w-full bg-[#0070f3] text-white py-2 px-4 rounded-lg hover:bg-[#0070f3] transition duration-200"
                    >
                        Play Now
                    </button>
                </div>
            </div>

            <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden" style={{ background: 'linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0))' }}>
                <div className="p-4 sm:p-8">
                    <div className="uppercase tracking-wide text-sm text-white font-semibold">
                        Upcoming Contest
                    </div>
                    <h1 className="block mt-1 text-lg leading-tight font-medium text-white">
                        Tomorrow&apos;s NBA Games ({tomorrowGames.length} games)
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Get ready for tomorrow&apos;s NBA matchups!
                    </p>
                    <button
                        onClick={() => router.push('/tomorrow-picks')}
                        className="mt-4 w-full bg-[#0070f3] text-white py-2 px-4 rounded-lg hover:bg-[#0070f3] transition duration-200"
                    >
                        Preview Games
                    </button>
                </div>
            </div>
        </div>
    </div>
);

}