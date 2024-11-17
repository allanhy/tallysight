import { useRouter } from 'next/navigation';
import { Contest } from '@/app/types/contest';

// Props for the GamePicksModal component
interface GamePicksModalProps {
    contest: Contest; 
    onClose: () => void; 
}

// Modal for making game picks in a specific contest
export default function GamePicksModal({ contest, onClose }: GamePicksModalProps) {
    const router = useRouter();

    return (
        // Fullscreen overlay with semi-transparent black background
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* Modal content container */}
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl mx-4">
                {/* Header section: Title of the contest and close button */}
                <div className="flex justify-between items-center mb-4">
                    {/* Contest title displayed at the top */}
                    <h2 className="text-xl font-bold text-white">{contest.title}</h2>
                    {/* Close button (X icon) to exit the modal */}
                    <button 
                        onClick={onClose} // Calls the onClose function to close the modal
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Main content area: Game pick options */}
                <div className="space-y-4">
                    {/* Example game pick */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        {/* Display game info */}
                        <h3 className="text-white mb-2">Game 1: Team A vs Team B</h3>
                        {/* Buttons for selecting a team */}
                        <div className="flex gap-4">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Team A
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Team B
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer action buttons for canceling or submitting picks */}
                <div className="mt-6 flex justify-end gap-4">
                    {/* Cancel button to close the modal */}
                    <button 
                        onClick={onClose} // Calls the onClose function to close the modal
                        className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    {/* Submit button for finalizing picks */}
                    <button 
                        onClick={() => router.push('/sign-in')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Sign in to Submit Picks
                    </button>
                </div>
            </div>
        </div>
    );
}