// WARNING: This file is deprecated please use the DailyPicks and TomorrowPicks 
//
//
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { LockClosedIcon } from '@heroicons/react/24/solid';

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
  // Add a state to track if games are locked
  const [gamesLocked, setGamesLocked] = useState(false);
  // Add state for game locking based on start time
  const [firstGameLocked, setFirstGameLocked] = useState(false);
  // Add state for countdown timer
  const [countdown, setCountdown] = useState<string | null>(null);

  // Modify the useEffect to update a games state instead of relying on MOCK_GAMES
  const [games, setGames] = useState<Game[]>([]);

  // Add a loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableGames = games.filter(game => game.isAvailable);
  const isSubmitDisabled = isSubmitting || selectedPicks.size === 0;

  // Add this at the beginning of your component
  const forceZeroCountdown = () => {
    // Get the current time
    const now = new Date();
    
    // If there are no games, we can't determine if they've started
    if (games.length === 0) return false;
    
    // Sort games by date
    const sortedGames = [...games].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Get the first game
    const firstGame = sortedGames[0];
    if (!firstGame.date) return false;
    
    // Parse the game time
    const gameTime = new Date(firstGame.date);
    
    // Log the times for debugging
    console.log('First game time:', gameTime);
    console.log('Current time:', now);
    console.log('Difference (ms):', gameTime.getTime() - now.getTime());
    
    // If the game has started, return true
    return now.getTime() >= gameTime.getTime();
  };

  // Function to check if first game has started
  const checkFirstGameStarted = () => {
    if (games.length === 0) return false;
    
    // Sort games by date
    const sortedGames = [...games].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Check if first game has started
    const firstGame = sortedGames[0];
    if (!firstGame.date) return false;
    
    const gameTime = new Date(firstGame.date);
    const currentTime = new Date();
    
    console.log('First game time:', gameTime);
    console.log('Current time:', currentTime);
    console.log('Game started:', currentTime >= gameTime);
    
    return currentTime >= gameTime;
  };

  // Function to calculate time remaining until first game
  const calculateTimeRemaining = () => {
    // If games are locked or first game is locked, return 0
    if (games.length === 0 || firstGameLocked) return "0:00:00";
    
    // Sort games by date
    const sortedGames = [...games].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Get first game
    const firstGame = sortedGames[0];
    if (!firstGame.date) return "0:00:00";
    
    const gameTime = new Date(firstGame.date);
    const currentTime = new Date();
    
    // Subtract 24 hours from the game time
    const adjustedGameTime = new Date(gameTime.getTime() - 24 * 60 * 60 * 1000);
    
    // If the adjusted game time has passed, return 0
    if (currentTime >= adjustedGameTime) {
        // If we detect the game has started, make sure to set the lock state
        if (!firstGameLocked) {
            setFirstGameLocked(true);
            localStorage.setItem('firstGameLocked', 'true');
        }
        return "0:00:00";
    }
    
    // Calculate time difference
    const diffMs = adjustedGameTime.getTime() - currentTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchOdds = async () => {
    try {
      setIsLoading(true);
      const currentTime = new Date();

      // Fetch user picks if signed in
      let pickedGameIds = new Set<string>();
      if (isSignedIn) {
        const picksResponse = await axios.get('/api/userPicks');
        pickedGameIds = new Set<string>(picksResponse.data.map((pick: any) => pick.gameId));
        setUserPicks(pickedGameIds);
      }
      
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

      // Combine odds and stats data
      const mergedGames = oddsData.games.map((game: any) => {
        const isAvailable = !pickedGameIds.has(game.id);

        return {
          ...game,
          stats: statsData.games.find(
            (statGame: any) =>
              statGame.team1.name === game.team1.name ||
              statGame.team2.name === game.team2.name
          )?.stats || {},
          isAvailable,
        };
      });
      console.log('Merged Games:', mergedGames);
      console.log(currentTime);

      setGames(mergedGames);
      setWeek(week);
      setWeekStart(weekStart);
      setWeekEnd(weekEnd);
      
      // Check if first game has started and persist the lock state
      const isFirstGameStarted = checkFirstGameStarted();
      
      // Only update the lock state if it's not already locked or if we detect it should be locked
      // This ensures we don't reset a locked state back to unlocked
      if (!firstGameLocked || isFirstGameStarted) {
        setFirstGameLocked(isFirstGameStarted);
      }
      
      // Reset the games locked state when fresh data is loaded
      setGamesLocked(false);

      // Set initial countdown
      setCountdown(calculateTimeRemaining());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('API Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load initial data
    fetchOdds();
    
    // Check local storage for persisted lock state
    const savedLockState = localStorage.getItem('firstGameLocked');
    if (savedLockState === 'true') {
      setFirstGameLocked(true);
    }
    
    // Set initial countdown
    setCountdown(calculateTimeRemaining());
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setCountdown(calculateTimeRemaining());
    }, 1000);
    
    // Refresh odds every 5 minutes
    const interval = setInterval(() => {
      // Lock games before refreshing data
      setGamesLocked(true);
      fetchOdds();
    }, 5 * 60 * 1000);
    
    // Add a timer to check if first game has started every minute
    const lockCheckInterval = setInterval(() => {
      const isLocked = checkFirstGameStarted();
      if (isLocked) {
        setFirstGameLocked(true);
        // Persist the lock state
        localStorage.setItem('firstGameLocked', 'true');
      }
    }, 60 * 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(lockCheckInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Add an effect to persist the lock state
  useEffect(() => {
    if (firstGameLocked) {
      localStorage.setItem('firstGameLocked', 'true');
    }
  }, [firstGameLocked]);

  // Add a function to reset the lock state when new games are loaded
  // This should be called when a new set of games becomes available
  const resetLockState = () => {
    setFirstGameLocked(false);
    localStorage.removeItem('firstGameLocked');
  };

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
  
  // Add this at the top of your component, right after your state declarations
  useEffect(() => {
    // Force the countdown to show 0:00:00
    setCountdown("0:00:00");
    
    // Force the lock state to be true
    setFirstGameLocked(true);
    localStorage.setItem('firstGameLocked', 'true');
  }, []);

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
    // Don't allow selection if games are locked
    if (gamesLocked) return;
    
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
      router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
      return;
    }
    
    // Check if entry fee is selected
    if (!selectedFee) {
      alert("Please select an entry fee");
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
      console.log('Sending picks to server:', picksArray); // Debug log
      
      const response = await axios.post('/api/savePicks', { 
        picks: picksArray,
        entryFee: selectedFee // Include the entry fee
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        console.log('Picks saved successfully:', response.data);
        setSubmissionStatus('Picks Saved!');
        // Wait for 2 seconds before routing
        setTimeout(() => {
          router.push('/myPicks');
        }, 2000);
      } else {
        console.error('Failed to save picks:', response.data.message);
        setSubmissionStatus('Failed to Save Picks');
        alert('Failed to save picks. Please try again.');
      }
    } catch (error) {
      console.error('Error saving picks:', error);
      setSubmissionStatus('Error Saving Picks');
      alert('Error saving picks. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this handler near your other handlers
  const handleReset = () => {
    setSelectedPicks(new Set());
    setStarredPicks(new Set());
  };

  // Add this to your component to log the current state
  useEffect(() => {
    console.log('First game locked:', firstGameLocked);
    console.log('Current countdown:', countdown);
  }, [firstGameLocked, countdown]);

  // Add this function to explicitly check if the countdown should be zero
  const getDisplayCountdown = () => {
    // Always return "0:00:00" if the game is locked
    if (firstGameLocked) {
      return "0:00:00";
    }
    
    // Otherwise return the calculated countdown
    return countdown || "0:00:00";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black">
      {/* Week Header: Updated background */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-4">
        <div className="inline-block bg-gray-800/50 rounded-lg p-4 text-white text-center">
          <div className="font-bold">WEEK {week}</div>
          {weekStart && weekEnd && (
            <div className="text-sm text-gray-400">
              {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} - {new Date(weekEnd).toLocaleDateString('en-US', { day: 'numeric' })}         
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Status Bar with more prominent lock indication and countdown */}
      <div className="text-center py-2 text-sm">
        <div className="text-gray-300">
          Spread finalized | Picks lock: At the start of each game 
          <span className="ml-2 font-bold">
            LOCKED (0:00:00)
          </span>
        </div>
        {gamesLocked ? (
          <div className="py-3 mt-1 text-white bg-red-600 flex items-center justify-center font-bold text-lg animate-pulse">
            <LockClosedIcon className="h-6 w-6 mr-2" />
            GAMES LOCKED - REFRESH PAGE TO CONTINUE
            <LockClosedIcon className="h-6 w-6 ml-2" />
          </div>
        ) : null}
        {firstGameLocked && (
          <div className="py-3 mt-1 text-white bg-red-600 flex items-center justify-center font-bold text-lg animate-pulse">
            <LockClosedIcon className="h-6 w-6 mr-2" />
            FIRST GAME HAS STARTED - PICKS ARE LOCKED (0:00:00)
            <LockClosedIcon className="h-6 w-6 ml-2" />
          </div>
        )}
      </div>

      {/* Games Grid with lock overlay when locked */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 pb-24 relative">
        {/* Add a semi-transparent overlay with lock icon when games are locked */}
        {(gamesLocked || firstGameLocked) && (
          <div className="absolute inset-0 bg-red-900/30 z-10 flex flex-col items-center justify-center">
            <LockClosedIcon className="h-24 w-24 text-white mb-4" />
            <div className="text-white text-2xl font-bold">
              {firstGameLocked ? "FIRST GAME HAS STARTED - PICKS ARE LOCKED" : "GAMES LOCKED"}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-xl"
            >
              Refresh Page to Continue
            </button>
          </div>
        )}
        
        {games.map((game) => (
          <div key={game.id} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow border border-gray-700">
            {/* Game Header */}
            <div className="flex justify-between p-4">
              <span className="text-gray-300">{game.date}</span>
              <button className="text-blue-400 hover:text-blue-300" 
                      onClick={() => { setPreviewedGame(game); setIsPreviewOpen(true); }}>
                Preview
              </button>
            </div>

            {/* Teams */}
            {[game.team1, game.team2].map((team, idx) => (
              <button
                key={idx}
                onClick={() => handleTeamSelection(game.id, idx)}
                disabled={!game.isAvailable || gamesLocked}
                className={`w-full p-4 flex items-center justify-between border-2 ${
                  selectedPicks.has(`${game.id}-${idx}`)
                    ? 'border-blue-500 rounded-lg'
                    : 'border-transparent'
                  } ${!game.isAvailable || gamesLocked ? 'opacity-25 cursor-not-allowed' : ''} 
                  hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full">
                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white">{team.name}</span>
                  <span className="text-gray-300">{team.spread}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  selectedPicks.has(`${game.id}-${idx}`)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-500'
                }`} />
              </button>
            ))}

            {/* Best Pick section */}
            <div className="border-t border-gray-700 flex justify-between p-4">
              <span className="text-gray-300">Best pick</span>
              <button 
                onClick={() => {
                  // Don't allow changes if games are locked
                  if (gamesLocked) return;
                  
                  const newStarred = new Set(starredPicks);
                  if (newStarred.has(game.id)) {
                    newStarred.delete(game.id);
                  } else {
                    newStarred.add(game.id);
                  }
                  setStarredPicks(newStarred);
                }}
                disabled={gamesLocked}
                className={`text-2xl ${gamesLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {starredPicks.has(game.id) ? '⭐' : '☆'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Panel: Updated colors */}
      {isReviewOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 z-50 rounded-t-xl shadow-lg border-t border-gray-700">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsReviewOpen(false)}>
                  <svg className="w-6 h-6 transform rotate-180" fill="none" stroke="gray" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-white">Review picks: {picksCount}</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleReset}
                  className="text-red-500 hover:text-red-700"
                >
                  Reset
                </button>
                <button onClick={() => setIsReviewOpen(false)} className="text-white hover:text-gray-300">
                  Close
                </button>
              </div>
            </div>

            {/* Selected picks styling */}
            <div className="flex gap-6">
              <div className="flex-1 space-y-4">
                {Array.from(selectedPicks).map(pickId => {
                  const team = getPickDetails(pickId);
                  if (!team) return null;
                  return (
                    <div key={pickId} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-700 rounded-full">
                          <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{team.name}</div>
                          <div className="text-sm text-white">{team.spread}</div>
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

              {/* Entry fee section */}
              <div className="w-96">
                <div className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700 sticky top-4">
                  <h3 className="font-bold mb-4">Select an entry fee</h3>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {['$5', '$10', '$20', '$50', '$100'].map(fee => (
                      <button 
                        key={fee} 
                        onClick={() => setSelectedFee(fee)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedFee === fee 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
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

      {/* Progress Footer: Updated colors */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg border-t border-gray-700">
        <div className="max-w-md mx-auto p-4">
          <button 
            onClick={() => setIsReviewOpen(true)}
            className="w-full flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 transform ${isReviewOpen ? 'rotate-180' : ''}`} fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-white">{picksCount}/{availableGames.length} picks made</span>
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
      </div>

      {/* Preview Modal: Updated colors */}
      {isPreviewOpen && previewedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-xl w-11/12 max-w-lg shadow-2xl border border-gray-700">
            {/* Header - Changed text-black to text-white */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Game Preview</h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Teams Container - Changed text colors to white */}
            <div className="flex items-start justify-between mb-10">
              {/* Team 1 */}
              <div className="text-center w-1/3">
                <img
                  src={previewedGame.team1.logo}
                  alt={previewedGame.team1.name}
                  className="w-28 h-28 mx-auto mb-8"
                />
                <h3 className="font-bold text-lg mb-8 text-white">{previewedGame.team1.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-8">{previewedGame.team1.spread}</p>
                <p className="text-gray-400">{previewedGame.stats?.team1?.wins}-{previewedGame.stats?.team1?.losses}</p>
              </div>

              {/* Center Column */}
              <div className="text-center w-1/3 pt-36">
                <p className="font-bold text-xl mb-12 text-white">vs</p>
                <div className="space-y-[3.5rem] text-gray-400">
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
                <h3 className="font-bold text-lg mb-8 text-white">{previewedGame.team2.name}</h3>
                <p className="text-2xl font-bold text-red-600 mb-8">{previewedGame.team2.spread}</p>
                <p className="text-gray-400">{previewedGame.stats?.team2?.wins}-{previewedGame.stats?.team2?.losses}</p>
              </div>
            </div>

            {/* Game Details - Changed text colors */}
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 font-semibold text-white">Date:</span>
                <span className="text-gray-300">{previewedGame.date || 'TBD'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold text-white">Venue:</span>
                <span className="text-gray-300">{previewedGame.venue || 'TBD'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold text-white">Broadcast:</span>
                <span className="text-gray-300">{previewedGame.broadcast || 'TBD'}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-semibold text-white">Status:</span>
                <span className="text-gray-300">{previewedGame.status || 'scheduled'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
