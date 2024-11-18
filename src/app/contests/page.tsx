/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect ,useRef } from 'react';
import ContestCard from '../components/ContestCard';
import WeekSelector from '../components/WeekSelector';

export default function ContestsPage() {
    // Which week we're looking at - starts on current week
    const [contestsData, setContestsData] = useState<{current: any[]; past: {[key: number]: any[]}} | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<'current' | number>('current');

    // Refs for each week's section to enable smooth scrolling
    const weekRefs = {
        'current': useRef<HTMLDivElement>(null),
        1: useRef<HTMLDivElement>(null),
        2: useRef<HTMLDivElement>(null),
        3: useRef<HTMLDivElement>(null),
        4: useRef<HTMLDivElement>(null),
    };

    // Fetching Contest Data from database
    useEffect(() => {
        const fetchContests = async() => {
            try {
                const response = await fetch('api/contests/get');
                if (!response.ok) {
                    throw new Error(`HTTP Error: status: ${response.status}`);
                }
                const contentType = response.headers.get('Content-Type');
                if (!contentType || !contentType.includes('application/json')){
                    throw new Error('Expected JSON response but received: ' + contentType);
                }

                let data;
                try{
                    data = await response.json();
                    console.log('Data: ',data);
                } catch (error) {
                    const err = error as Error;
                    throw new Error(`Failed to parse JSON: ${err.message}`);
                }
                // Sorting data into current and previous weeks for displaying
                const currentWeek = data.contests.filter((contest: any) => contest.status === 'open');
                const pastWeeks = data.contests
                    .filter((contest: any) => contest.status === 'completed')
                    .reduce((acc: any, contest: any) => {
                        const week = contest.week || 1;
                        acc[week] = acc[week] || [];
                        acc[week].push(contest);
                        return acc;
                    }, {});
                setContestsData({current: currentWeek, past: pastWeeks});
            } catch (error) {
                const err = error as Error;
                console.error(`Error fetching contests: ${err.message}`, {error});
            }
        };

        fetchContests();
    }, []);

    // This handles switching weeks and scrolls you to the right spot on the page
    const handleWeekChange = (week: 'current' | number) => {
        setSelectedWeek(week); 

        const offset = -100; // Offset to account for any fixed header height
        const element = weekRefs[week as keyof typeof weekRefs]?.current; 

        if (element) {
            // Calculate the position to scroll to
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY + offset;

            // Smoothly scroll to the target position
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    if (!contestsData) {
        return <div className="min-h-screen bg-black text-white text-center flex flex-col px-14 py-8">Loading contests...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col px-14 py-8">
            {/* Sticky Week Selector at the top of the page */}
            <div className="sticky top-0 z-10 bg-black pb-4">
                <WeekSelector 
                    selectedWeek={selectedWeek} 
                    onChange={handleWeekChange}
                />
            </div>

            {/* Section for the current week's contests */}
            <div ref={weekRefs.current} className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-white">Current Week Contests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {/* Loop through current week's contests and render each as a ContestCard */}
                        {contestsData.current.length > 0 ? (
                            contestsData.current.map((contest) => (
                                <ContestCard 
                                key={contest.id} // Unique key for each contest
                                contest={contest} 
                                isActive={true} // Current week's contests are active
                                userResult={contest.userResult} // Optional: pass user result
                                />
                            ))
                        ) : (
                            <p className="text-white">No contests available for this week.</p>
                        )}
                        
                    </div>
            </div>

            {/* Sections for past weeks' contests */}
            {[1, 2, 3, 4].map((week) => (
                <div 
                    key={week} // Unique key for each week's section
                    ref={weekRefs[week as keyof typeof weekRefs]} // Attach ref for scrolling
                    className="scroll-mt-32"
                >
                    {/* Header for each past week */}
                    <h2 className="text-2xl font-bold mb-6 text-white">Week {week} Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {/* Loop through past contests for the current week and render each as a ContestCard */}
                        {contestsData?.past[week]?.length > 0 ? (
                            contestsData.past[week].map((contest) => (
                                <ContestCard 
                                    key={contest.contest_id || contest.id}
                                    contest={contest} 
                                    isActive={false} // Past week's contests are not active
                                    userResult={contest.userResult}
                                />
                            ))
                        ) : (
                            <p className="text-white">No contests available for Week {week}.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}