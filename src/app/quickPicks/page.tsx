"use client";

/**
 * QUICK PICKS PAGE - UI ONLY (API Integration Required)
 * 
 * This is the frontend implementation of the Quick Picks feature.
 * Currently using mock data for development and testing.
 * 
 * TODO: Required API Integration:
 * - Real-time game data and spreads
 * - User authentication and session management
 * - Pick submission and validation
 * - Entry fee processing
 * - Best pick tracking
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PicksPage() {
  // State Management
  const router = useRouter();
  const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set()); // Tracks selected team picks using gameId-teamIndex format
  const [starredPicks, setStarredPicks] = useState<Set<number>>(new Set()); // Tracks which games are marked as "Best Pick"
  const [isReviewOpen, setIsReviewOpen] = useState(false); // Controls visibility of review panel
  const [selectedFee, setSelectedFee] = useState<string>(''); // Tracks selected entry fee amount
  const [mounted, setMounted] = useState(false);
  const [formattedDates, setFormattedDates] = useState({
    gameDate: '',
    weekRange: ''
  });

  const picksCount = selectedPicks.size;

  // Move all date formatting into useEffect
  useEffect(() => {
    setMounted(true);
    
    // Format dates only after component mounts
    const formatGameDate = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };

      return tomorrow.toLocaleString('en-US', options).replace(',', ' •');
    };

    const formatWeekRange = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);

      const options: Intl.DateTimeFormatOptions = { 
        month: 'short',
        day: 'numeric'
      };

      return `Tomorrow ${tomorrow.toLocaleString('en-US', options)}-${dayAfterTomorrow.toLocaleString('en-US', options)}`;
    };

    setFormattedDates({
      gameDate: formatGameDate(),
      weekRange: formatWeekRange()
    });
  }, []);

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  // Utility function: Extracts team details from a pick ID (format: "gameId-teamIndex")
  const getPickDetails = (pickId: string) => {
    const [gameId, teamIndex] = pickId.split('-').map(Number);
    const game = MOCK_GAMES.find(g => g.id === gameId);
    return game ? (teamIndex === 0 ? game.team1 : game.team2) : null;
  };

  // Handler: Removes a pick from the selectedPicks Set
  const handleDeletePick = (pickId: string) => {
    const newPicks = new Set(selectedPicks);
    newPicks.delete(pickId);
    setSelectedPicks(newPicks);
  };

  // Navigation: Redirects user to sign-in page
  const handleSignIn = () => {
    router.push('/sign-in'); // Update this path to match your sign-in page route
  };

  // Update MOCK_GAMES to avoid date calculations during render
  const MOCK_GAMES = mounted ? [
    {
      id: 1,
      date: formattedDates.gameDate,
      team1: { name: "Steelers", spread: "-1.5", logo: "/Steelers.webp" },
      team2: { name: "Colts", spread: "+1.5", logo: "/Colts.png" }
    },
    {
      id: 2,
      date: formattedDates.gameDate,
      team1: { name: "Bengals", spread: "-4.5", logo: "/Bengals.png" },
      team2: { name: "Panthers", spread: "+4.5", logo: "/Panthers.png" }
    },
    {
      id: 3,
      date: formattedDates.gameDate,
      team1: { name: "Eagles", spread: "-1.5", logo: "/Eagles.png" },
      team2: { name: "Buccaneers", spread: "+1.5", logo: "/Buccaneers.webp" }
    },
    // Add more games as needed...
  ] : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Week Header: Displays current week number and date range */}
      <div className="bg-gray-900 p-4">
        <div className="inline-block bg-gray-800 rounded-lg p-2 text-white">
          <div className="font-bold">Week #</div>
          <div className="text-sm text-gray-400">{formattedDates.weekRange}</div>
        </div>
      </div>

      {/* Status Bar: Shows game status and pick deadline information */}
      <div className="text-center py-2 text-sm">
        <div className="text-gray-600">Spread finalized | Picks lock: At the start of each game</div>
        <div className="bg-red-100 py-2 mt-1 text-black">Make your picks</div>
      </div>

      {/* Games Grid: Main container for all game cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_GAMES.map((game) => (
          <div key={game.id} className="bg-white rounded-lg shadow">
            {/* Game Card Structure:
                - Game date and preview button
                - Team selection buttons with logos and spreads
                - Best pick star toggle
            */}
            {/* Game Header */}
            <div className="flex justify-between p-4">
              <span className="text-gray-600">{game.date}</span>
              <button className="text-cyan-500">Preview</button>
            </div>

            {/* Teams */}
            {[game.team1, game.team2].map((team, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const newPicks = new Set(selectedPicks);
                  const pickId = `${game.id}-${idx}`;
                  if (newPicks.has(pickId)) {
                    newPicks.delete(pickId);
                  } else {
                    newPicks.add(pickId);
                    newPicks.delete(`${game.id}-${idx ? 0 : 1}`);
                  }
                  setSelectedPicks(newPicks);
                }}
                className={`w-full p-4 flex items-center justify-between border-2 ${
                  selectedPicks.has(`${game.id}-${idx}`)
                    ? 'border-cyan-500 rounded-lg'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full">
                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-black">{team.name}</span>
                  <span className="text-gray-600">{team.spread}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  selectedPicks.has(`${game.id}-${idx}`)
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'border-gray-300'
                }`} />
              </button>
            ))}

            {/* Updated Best Pick section */}
            <div className="border-t flex justify-between p-4">
              <span className="text-gray-600">Best pick</span>
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
                className="text-2xl" // Increased star size
              >
                {starredPicks.has(game.id) ? '⭐' : '☆'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Panel: Slide-up panel showing selected picks and entry options 
          - Left column: List of selected picks with delete option
          - Right column: Entry fee selection and sign-in button
      */}
      {isReviewOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-xl shadow-lg" 
             style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsReviewOpen(false)}>
                  <svg className="w-6 h-6 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-black">Review picks: {picksCount}</span>
              </div>
              <button onClick={() => setIsReviewOpen(false)} className="text-black">
                Close
              </button>
            </div>

            {/* Two-column layout */}
            <div className="flex gap-6">
              {/* Left column - Selected picks */}
              <div className="flex-1 space-y-4">
                {Array.from(selectedPicks).map(pickId => {
                  const team = getPickDetails(pickId);
                  if (!team) return null;
                  return (
                    <div key={pickId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-black">{team.name}</div>
                          <div className="text-sm text-gray-600">{team.spread}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePick(pickId)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Right column - Entry fee */}
              <div className="w-96">
                <div className="bg-gray-900 text-white p-4 rounded-lg sticky top-4">
                  <h3 className="font-bold mb-4">Select an entry fee</h3>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {['$5', '$10', '$20', '$50', '$100'].map(fee => (
                      <button 
                        key={fee} 
                        onClick={() => setSelectedFee(fee)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedFee === fee 
                            ? 'bg-white text-black' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {fee}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleSignIn}
                    className="w-full bg-cyan-400 text-black py-3 rounded-lg font-bold hover:bg-cyan-300 transition-colors"
                  >
                    Sign in to submit entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Footer: 
          - Shows number of picks made out of 15
          - Visual progress indicator
          - Opens review panel when clicked
      */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="max-w-md mx-auto p-4">
          <button 
            onClick={() => setIsReviewOpen(true)}
            className="w-full flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-4 h-4 transform ${isReviewOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-black">{picksCount}/15 picks made</span>
            </div>
            <div className="flex gap-1 justify-center w-full">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < picksCount ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}