import { Suspense } from 'react';
import DailyPicks from './DailyPicks';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export default function DailyPicksPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-[#1a1a1a]">
            <div className="bg-[#2a2a2a] p-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
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
            <div className="p-2 text-center text-sm text-gray-300">
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
    }>
      <DailyPicks />
    </Suspense>
  );
}