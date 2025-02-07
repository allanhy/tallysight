'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ContestCard from '../components/ContestCard';
import WeekSelector from '../components/WeekSelector';
import { useUser } from '@clerk/nextjs';

export default function ContestsPage() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [contestsData, setContestsData] = useState<{current: any[]; past: {[key: number]: any[]}} | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<'current' | number>('current');

    // Refs for each week's section
    const weekRefs = {
        'current': useRef<HTMLDivElement>(null),
        1: useRef<HTMLDivElement>(null),
        2: useRef<HTMLDivElement>(null),
        3: useRef<HTMLDivElement>(null),
        4: useRef<HTMLDivElement>(null),
    };

    // Fetching Contest Data
    useEffect(() => {
        const fetchContests = async() => {
            try {
                const response = await fetch('api/contests/get');
                if (!response.ok) {
                    throw new Error(`HTTP Error: status: ${response.status}`);
                }
                const data = await response.json();
                setContestsData(data);
            } catch (error) {
                console.error('Error fetching contests:', error);
            }
        };
        fetchContests();
    }, []);

    // This handles switching weeks and scrolls you to the right spot on the page
    const handleWeekChange = (week: 'current' | number) => {
        setSelectedWeek(week);
        weekRefs[week]?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!contestsData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col px-14 py-8">
            {/* Sticky Week Selector */}
            <div className="sticky top-0 z-10 bg-black pb-4">
                <WeekSelector 
                    selectedWeek={selectedWeek} 
                    onChange={handleWeekChange}
                />
            </div>

            {/* Current Week Section */}
            <div ref={weekRefs.current} className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-white">Current Week Contests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {/* Daily NBA Picks Card */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                        <div className="p-6 bg-blue-600">
                            <h3 className="text-xl font-bold text-white">Daily NBA Picks</h3>
                            <p className="text-gray-200 mt-2">Make your daily NBA picks and compete!</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="text-gray-300 mb-2">Today's Games:</div>
                                <div className="text-white font-bold">NBA Basketball</div>
                            </div>
                            <div className="mb-6">
                                <div className="text-gray-300 mb-2">Entry:</div>
                                <div className="text-white font-bold">Free</div>
                            </div>
                            <button
                                onClick={() => router.push('/daily-picks')}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Play Now
                            </button>
                        </div>
                    </div>

                    {/* Weekly NFL Picks Card */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                        <div className="p-6 bg-blue-600">
                            <h3 className="text-xl font-bold text-white">Weekly NFL Picks</h3>
                            <p className="text-gray-200 mt-2">Make your weekly NFL picks and compete!</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="text-gray-300 mb-2">This Week's Games:</div>
                                <div className="text-white font-bold">NFL Football</div>
                            </div>
                            <div className="mb-6">
                                <div className="text-gray-300 mb-2">Entry:</div>
                                <div className="text-white font-bold">Free</div>
                            </div>
                            <button
                                onClick={() => router.push('/weekly-picks')}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Play Now
                            </button>
                        </div>
                    </div>

                    {/* Existing Contest Cards */}
                    {(contestsData?.current || []).map((contest) => (
                        <ContestCard 
                            key={contest.id}
                            contest={contest} 
                            isActive={true}
                            userResult={contest.userResult}
                        />
                    ))}
                </div>
            </div>

            {/* Past Weeks Sections */}
            {[1, 2, 3, 4].map((week) => {
                const weekContests = contestsData?.past?.[week] || [];
                return weekContests.length > 0 ? (
                    <div 
                        key={week}
                        ref={weekRefs[week as keyof typeof weekRefs]}
                        className="scroll-mt-32"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-white">Week {week} Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            {weekContests.map((contest) => (
                                <ContestCard 
                                    key={contest.contest_id || contest.id}
                                    contest={contest} 
                                    isActive={false}
                                    userResult={contest.userResult}
                                />
                            ))}
                        </div>
                    </div>
                ) : null;
            })}
        </div>
    );
}