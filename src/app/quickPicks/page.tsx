"use client";

/**
 * QUICK PICKS PAGE - UI ONLY (API Integration Required)
 * 
 * This is the frontend implementation of the Quick Picks feature.
 * Currently using mock data for development and testing.
 * 
 * TODO: Required API Integration:
 * - User authentication and session management
 * - Entry fee processing
 * - Best pick tracking
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

// Add these type definitions at the top of the file
interface Team {
  name: string;
  spread: string;
  logo: string;
}

interface Game {
  id: string;
  date?: string;
  team1: {
    name: string;
    spread: string;
    logo: string;
  };
  team2: {
    name: string;
    spread: string;
    logo: string;
  };
  week: number;
  venue: string;
  broadcast: string;
  status: string;
  isAvailable?: boolean;
  stats?: {
    team1: {
      points: number;
      wins: number;
      losses: number;
      record?: string;
    };
    team2: {
      points: number;
      wins: number;
      losses: number;
      record?: string;
    };
  };
}

export default function PicksPage() {
  // State Management
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [selectedPicks, setSelectedPicks] = useState<Set<string>>(new Set()); // Tracks selected team picks using gameId-teamIndex format
  const [starredPicks, setStarredPicks] = useState<Set<string>>(new Set()); // Tracks which games are marked as "Best Pick"
  const [userPicks, setUserPicks] = useState<Set<string>>(new Set<string>());
  const [isReviewOpen, setIsReviewOpen] = useState(false); // Controls visibility of review panel
  const [selectedFee, setSelectedFee] = useState<string>(''); // Tracks selected entry fee amount
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewedGame, setPreviewedGame] = useState<Game | null>(null); // Controls visibility of review panel
  const [week, setWeek] = useState<number>(0);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [weekEnd, setWeekEnd] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if form is submitting
  const [submissionStatus, setSubmissionStatus] = useState('Submit Entry'); // New state for tracking button text
  const picksCount = selectedPicks.size;

  // Modify the useEffect to update a games state instead of relying on MOCK_GAMES
  const [games, setGames] = useState<Game[]>([]);

  // Add a loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableGames = games.filter(game => game.isAvailable);
  const isSubmitDisabled = isSubmitting || selectedPicks.size === 0;

  const fetchOdds = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both odds and team stats
      const [oddsResponse, statsResponse] = await Promise.all([
        fetch('/api/odds'),
        fetch('/api/teamStats/preview')  // adjust path as needed
      ]);
      
      if (!oddsResponse.ok || !statsResponse.ok) {
        throw new Error(`API failed: ${oddsResponse.status || statsResponse.status}`);
      }

      const oddsData = await oddsResponse.json();
      const statsData = await statsResponse.json();

      // Merge the data
      const mergedGames = oddsData.games.map((game: any) => ({
        ...game,
        stats: statsData.games.find((statGame: any) => 
          statGame.team1.name === game.team1.name || 
          statGame.team2.name === game.team2.name
        )?.stats || {}
      }));

      setGames(mergedGames);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('API Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();
    
    // Refresh odds every 5 minutes
    const interval = setInterval(fetchOdds, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Prevents scrolling when previews are open
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isPreviewOpen]);
  

  // Show loading state or nothing during initial render
  // Ensures real time data is rendered otherwise stuck in loading state
  if (isLoading || games.length < 1) {
    return (
      <div className="min-h-screen bg-black-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Utility function: Extracts team details from a pick ID (format: "gameId-teamIndex")
  const getPickDetails = (pickId: string) => {
    const match = pickId.match(/^(.+?)-(\d+)$/);
    if (match) {
      const gameId = match[1]; // Extracted gameId
      const teamIndex = parseInt(match[2], 10); // Extracted team index
      const game = games.find(g => g.id === gameId);
      return game ? (Number(teamIndex) === 0 ? game.team1 : game.team2) : null;
    }
  };
  
  const handleTeamSelection = (gameId: string, teamIndex: number) => {
    const newPicks = new Set(selectedPicks);
    const pickId = `${gameId}-${teamIndex}`;
    const opposingPickId = `${gameId}-${teamIndex === 0 ? 1 : 0}`;
  
    if (newPicks.has(pickId)) {
      newPicks.delete(pickId);
    } else {
      newPicks.add(pickId);
      newPicks.delete(opposingPickId);
    }
    setSelectedPicks(newPicks);
  };


  // Handler: Removes a pick from the selectedPicks Set
  const handleDeletePick = (pickId: string) => {
    const newPicks = new Set(selectedPicks);
    newPicks.delete(pickId);
    setSelectedPicks(newPicks);
  };

  // Navigation: Redirects user to sign-in page
  const handleSignIn = async () => {
    if (!isSignedIn) {
      const returnUrl = window.location.pathname;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`); // Update this path to match your sign-in page route
      return;
    }
    // Format selected picks
    const picksArray = Array.from(selectedPicks).map((pickId) => {
      const match = pickId.match(/^(.+?)-(\d+)$/);
      if (!match) {
        return null; // Skip invalid pickIds
      }
      const gameId = match[1];
      const teamIndex = parseInt(match[2], 10);  
      return { gameId, teamIndex };
    }).filter(Boolean); // Remove any null entries

    try {
      setIsSubmitting(true); // Set submitting state to true
      setSubmissionStatus('Submitting...');
      const response = await axios.post('/api/savePicks', { picks: picksArray }, {
        headers: { 'Content-Type': 'application/json' }
    });

      if (response.status === 200) {
        console.log('Picks saved successfully');
        setSubmissionStatus('Picks Saved!'); // Update to show success message
        // Wait for 2 seconds before routing
        setTimeout(() => {
          router.push('/myPicks');
        }, 2000);
      } else {
        console.error('Failed to save picks:', response.data.message);
        setSubmissionStatus('Failed to Save Picks');
      }
    } catch (error) {
      console.error('Error saving picks:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this handler near your other handlers
  const handleReset = () => {
    setSelectedPicks(new Set());
    setStarredPicks(new Set());
  };

  return (
    <div className="min-h-screen bg-black-100">
      {/* Week Header: Displays current week number and date range */}
      <div className="bg-gray-900 p-4">
      <div className="inline-block bg-gray-800 rounded-lg p-4 text-white text-center">
        <div className="font-bold">WEEK {week}</div>
        {weekStart && weekEnd && (
          <div className="text-sm text-gray-400">
            {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} - 
            {new Date(weekEnd).toLocaleDateString('en-US', { day: 'numeric' })}         
          </div>
        )}
      </div>
      </div>

      {/* Status Bar: Shows game status and pick deadline information */}
      <div className="text-center py-2 text-sm">
        <div className="text-gray-100">Spread finalized | Picks lock: At the start of each game</div>
        <div className="bg-red-200 py-2 mt-1 text-black">Make your picks</div>
      </div>

      {/* Games Grid: Main container for all game cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 pb-24">
        {games.map((game) => (
          <div key={game.id} className="bg-white rounded-lg shadow">
            {/* Game Card Structure:
                - Game date and preview button
                - Team selection buttons with logos and spreads
                - Best pick star toggle
            */}
            {/* Game Header */}
            <div className="flex justify-between p-4">
              <span className="text-gray-600">{game.date}</span>
              <button className="text-cyan-500" onClick={() => { setPreviewedGame(game); setIsPreviewOpen(true); }}>Preview</button>
              </div>

            {/* Teams */}
            {[game.team1, game.team2].map((team, idx) => (
              <button
                key={idx}
                onClick={() => handleTeamSelection(game.id, idx)}
                disabled={!game.isAvailable} // Disable if game is unavailable
                className={`w-full p-4 flex items-center justify-between border-2 ${
                  selectedPicks.has(`${game.id}-${idx}`)
                    ? 'border-cyan-500 rounded-lg'
                    : 'border-transparent'
                  } ${!game.isAvailable ? 'opacity-25 cursor-not-allowed' : ''}`}
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
        <div className="fixed bottom-0 left-0 right-0 bg-gray-300 z-50 rounded-t-xl shadow-lg" 
             style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsReviewOpen(false)}>
                  <svg className="w-6 h-6 transform rotate-180" fill="none" stroke="gray" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-black">Review picks: {picksCount}</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleReset}
                  className="text-red-500 hover:text-red-700"
                >
                  Reset
                </button>
                <button onClick={() => setIsReviewOpen(false)} className="text-black">
                  Close
                </button>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="flex gap-6">
              {/* Left column - Selected picks */}
              <div className="flex-1 space-y-4">
                {Array.from(selectedPicks).map(pickId => {
                  const team = getPickDetails(pickId);
                  if (!team) return null;
                  return (
                    <div key={pickId} className="flex items-center justify-between p-4 bg-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
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
                  {/* Conditionally render button based on login status */}
                  {isSignedIn ? (
                    <button 
                      onClick={handleSignIn}
                      disabled={isSubmitDisabled}
                      className={`w-full py-3 text-black rounded-lg font-bold transition-colors ${
                        isSubmitDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-cyan-400 hover:bg-cyan-300'
                      }`}
                    >
                      {submissionStatus}
                    </button>
                  ) : (
                    <button 
                      onClick={handleSignIn}
                      className="w-full bg-cyan-400 text-black py-3 rounded-lg font-bold hover:bg-cyan-300 transition-colors"
                    >
                      Sign in to submit entry
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Footer: 
          - Shows number of picks made out of the number of games
          - Visual progress indicator
          - Opens review panel when clicked
      */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-200 shadow-lg">
        <div className="max-w-md mx-auto p-4">
          <button 
            onClick={() => setIsReviewOpen(true)}
            className="w-full flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 transform ${isReviewOpen ? 'rotate-180' : ''}`} fill="none" stroke="#333333" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-black">{picksCount}/{availableGames.length} picks made</span>
            </div>
            <div className="flex gap-1 justify-center w-full">
              {availableGames.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < picksCount ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </button>
        </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-11/12 max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">Game Preview</h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Teams Container */}
            <div className="flex items-start justify-between mb-10">
              {/* Team 1 */}
              <div className="text-center w-1/3">
                <img
                  src={previewedGame.team1.logo}
                  alt={previewedGame.team1.name}
                  className="w-28 h-28 mx-auto mb-8"
                />
                <h3 className="font-bold text-lg mb-8">{previewedGame.team1.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-8">{previewedGame.team1.spread}</p>
                <p className="text-gray-600">{previewedGame.stats?.team1?.wins}-{previewedGame.stats?.team1?.losses}</p>
              </div>

              {/* Center Column - Reduced spacing between Spread and W-L */}
              <div className="text-center w-1/3 pt-36">
                <p className="font-bold text-xl mb-12">vs</p>
                <div className="space-y-[3.5rem] text-gray-600">
                  <p className="font-semibold">Spread</p>
                  <p className="font-semibold">W-L</p>
                </div>
              </div>

              {/* Team 2 */}
              <div className="text-center w-1/3">
                <img
                  src={previewedGame.team2.logo}
                  alt={previewedGame.team2.name}
                  className="w-28 h-28 mx-auto mb-8"
                />
                <h3 className="font-bold text-lg mb-8">{previewedGame.team2.name}</h3>
                <p className="text-2xl font-bold text-red-600 mb-8">{previewedGame.team2.spread}</p>
                <p className="text-gray-600">{previewedGame.stats?.team2?.wins}-{previewedGame.stats?.team2?.losses}</p>
              </div>
            </div>

            {/* Game Details */}
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 font-semibold">Date:</span>
                <span>{previewedGame.date || 'TBD'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold">Venue:</span>
                <span>{previewedGame.venue || 'TBD'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold">Broadcast:</span>
                <span>{previewedGame.broadcast || 'TBD'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold">Status:</span>
                <span>{previewedGame.status || 'scheduled'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
