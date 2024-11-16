import { Contest, UserResult } from '@/app/types/contest';
import { useState } from 'react';
import GamePicksModal from './GamePicksModal';

// Props for the ContestCard component
interface ContestCardProps {
    contest: Contest; 
    isActive: boolean; 
    userResult?: UserResult; // Optional user's result for completed contests
}

export default function ContestCard({ contest, isActive, userResult }: ContestCardProps) {
    // State to control whether the GPM is visible
    const [showPicksModal, setShowPicksModal] = useState(false);

    return (
        <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-r from-gray-900 to-black text-white h-full flex flex-col">
            {/* Header section contest title and category badge */}
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-white">{contest.title}</h2>
                {/* Display the contest category */}
                <span className="text-sm font-semibold bg-blue-600 text-white px-2 py-1 rounded">
                    {contest.category}
                </span>
            </div>

            {/* Contest description */}
            <p className="text-gray-300 mb-4 flex-grow">{contest.description}</p>
            
            <div className="mt-auto">
                {/* Status badge: active (green) or completed (gray) */}
                <div className={`inline-block px-2 py-1 rounded-full text-sm mb-4 ${
                    isActive ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'
                }`}>
                    {isActive ? 'Open for Picks' : 'Completed'}
                </div>

                {/* Stats section: number of players and picks made */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        {/* Number of players in the contest */}
                        <p className="text-gray-400">Players</p>
                        <p className="font-semibold text-white">{contest.participants}/{contest.maxParticipants}</p>
                    </div>
                    <div>
                        {/* Number of picks made by the user */}
                        <p className="text-gray-400">Picks Made</p>
                        <p className="font-semibold text-white">{contest.currentEntries}/{contest.maxEntries}</p>
                    </div>
                </div>

                {/* If the contest is active, show the play now button */}
                {isActive ? (
                    <>
                        {/* Button to open the GamePicksModal */}
                        <button 
                            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            onClick={() => setShowPicksModal(true)} // Show the modal when clicked
                        >
                            Play Now
                        </button>
                        {/* Render the game picks modal if showpicksmodal is true */}
                        {showPicksModal && (
                            <GamePicksModal 
                                contest={contest} 
                                onClose={() => setShowPicksModal(false)} // Close the modal
                            />
                        )}
                    </>
                ) : (
                    // If the contest is completed, show the user's results
                    userResult && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                            {/* Section title for the users results */}
                            <h3 className="font-semibold mb-3 text-white">Last Week's Results</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-800 p-4 rounded-lg">
                                <div>
                                    {/* Users position in the contest */}
                                    <p className="text-gray-400">Your Position</p>
                                    <p className="font-semibold text-white">
                                        #{userResult.position} of {userResult.totalParticipants}
                                    </p>
                                </div>
                                <div>
                                    {/* Points the user scored */}
                                    <p className="text-gray-400">Points</p>
                                    <p className="font-semibold text-white">
                                        {userResult.points}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}