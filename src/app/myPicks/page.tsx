import { Suspense } from 'react';
import MyPicksPage from './MyPicks';
import { Skeleton } from '../components/ui/skeleton';

export default function MyPickPage() {
    return (
        <Suspense fallback={
            <div className="picks-page">
                <div className="content-wrapper centered">
                    <div className="main-content">
                        <h1 className="picks-title text-black dark:text-white">
                            My Picks
                        </h1>

                        <div className="picks-container bg-gradient-to-r from-gray-900 to-black text-white">
                            <div className="picks-controls flex flex-wrap gap-4 mb-6">
                                <Skeleton className="h-10 w-full rounded-md bg-gray-600" />
                                <h2 className="picks-subtitle">Picks</h2>
                            </div>

                            <div className="days-container space-y-6">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                                        <Skeleton className="h-6 w-1/3 mb-4" />
                                        <div className="space-y-4">
                                            {[...Array(2)].map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className="pick-item bg-gray-800/50 p-4 rounded-lg"
                                                >
                                                    <div className="pick-details flex items-center justify-between">
                                                        <div className="team flex items-center gap-3">
                                                            <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
                                                            <Skeleton className="h-4 w-20 bg-gray-500" />
                                                        </div>

                                                        <Skeleton className="h-4 w-8" />

                                                        <div className="team flex items-center gap-3">
                                                            <Skeleton className="w-8 h-8 rounded-full bg-gray-600" />
                                                            <Skeleton className="h-4 w-20 bg-gray-500" />
                                                        </div>

                                                        <Skeleton className="h-4 w-24 bg-gray-600" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <MyPicksPage />
        </Suspense>
    );
}