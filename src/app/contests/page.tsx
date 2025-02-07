'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function ContestsPage() {
    const router = useRouter();
    const { isSignedIn } = useUser();

    const nextFiveDays = Array.from({length: 5}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            date: date,
            label: i === 0 ? "Today's" : 
                   i === 1 ? "Tomorrow's" : 
                   date.toLocaleDateString('en-US', { 
                       month: 'short', 
                       day: 'numeric'
                   }) + "'s"
        };
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="mb-8">
                <div className="inline-block bg-white text-black rounded-lg px-4 py-2">
                    🏆 Current Week
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Current Week Contests</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Daily NBA Pick Cards */}
                {nextFiveDays.map((day) => (
                    <div key={day.date.toISOString()} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                        <div className="p-6 bg-blue-600">
                            <h3 className="text-xl font-bold text-white">{day.label} NBA Picks</h3>
                            <p className="text-gray-200 mt-2">Make your daily NBA picks and compete!</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="text-gray-300 mb-2">Games:</div>
                                <div className="text-white font-bold">NBA Basketball</div>
                            </div>
                            <div className="mb-6">
                                <div className="text-gray-300 mb-2">Entry:</div>
                                <div className="text-white font-bold">Free</div>
                            </div>
                            <button
                                onClick={() => router.push(`/daily-picks?date=${day.date.toISOString()}`)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Play Now
                            </button>
                        </div>
                    </div>
                ))}

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
            </div>
        </div>
    );
}