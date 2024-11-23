'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Pick {
    gameId: string;
    teamIndex: number;
  }
  
  interface Game {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo: string;
    awayTeamLogo: string;
  }
  
  interface TeamDetails {
    name: string;
    logo: string;
  }

export default function MyPicksPage() {
  const [isHistoryActive, setIsHistoryActive] = useState(false);
  const [userPicks, setUserPicks] = useState<Pick[]>([]);
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [gamesData, setGamesData] = useState<Game[]>([]);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [weekEnd, setWeekEnd] = useState<string | null>(null);
  const router = useRouter();

  const handleHistoryClick = () => {
    setIsHistoryActive(!isHistoryActive);
  };

  useEffect(() => {
    console.log("Fetched user picks:", userPicks);
    console.log("Fetched games data:", gamesData);
  }, [userPicks, gamesData]);
  
  useEffect(() => {
    if (isSignedIn) {
        const fetchUserPicks = async () => {
          try {
            const response = await axios.get('/api/userPicks');
            setUserPicks(response.data);
          } catch (error) {
            console.error('Error fetching user picks:', error);
          }
        };
        fetchUserPicks();
      }
    }, [isSignedIn]);

    // Fetch game data from the ESPN API for team logos and names
  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await axios.get('/api/games'); // assuming the ESPN API route is set to '/api/espn'

        const [oddsResponse, statsResponse] = await Promise.all([
            fetch('/api/odds'),
            fetch('/api/teamStats/preview'),
          ]);
    
          if (!oddsResponse.ok || !statsResponse.ok) {
            throw new Error('Failed to fetch data');
          }
    
          const oddsData = await oddsResponse.json();
          const statsData = await statsResponse.json();

        // Combine odds and stats
        const mergedGames = oddsData.games.map((game: any) => {
            const matchingStats = statsData.games.find(
              (statGame: any) => statGame.id === game.id // Adjust logic if IDs differ
            );
      
            return {
              id: game.id,
              homeTeam: game.team1.name,
              awayTeam: game.team2.name,
              homeTeamLogo: game.team1.logo,
              awayTeamLogo: game.team2.logo,
            };
      });
        setGamesData(mergedGames);
        setWeekStart(response.data.weekStart);
        setWeekEnd(response.data.weekEnd);
      } catch (error) {
        console.error('Error fetching games data:', error);
      }
    };
    fetchGamesData();
  }, []);

  // Helper function to get team details (name and logo) for user picks
  const getTeamDetails = (gameId: string, teamIndex: number): TeamDetails | null => {
    const game = gamesData.find((g) => g.id === gameId);
    if (!game) return null;

    const team = teamIndex === 0
      ? { name: game.homeTeam, logo: game.homeTeamLogo }
      : { name: game.awayTeam, logo: game.awayTeamLogo };
    return team;
  };
    return (
        <div className="picks-page">
            <div className="history-button-container">
                <button className="history-button">History</button>
            </div>
            <div className="content-wrapper">
                <div className="main-content">
                    <h1 className="picks-title">My Picks</h1>
                    <div className="picks-container">
                        {isHistoryActive ? (
                            // History View Container
                            <div className="picks-container bg-gradient-to-r from-gray-900 to-black text-white">
                                {/* History Button */}
                                <div className="history-button-container">
                                    <button 
                                        className={`history-button ${isHistoryActive ? 'active' : ''}`}
                                        onClick={handleHistoryClick}
                                    >
                                        History
                                    </button>
                                </div>
                                
                                <h2 className="history-title text-white">History</h2>
                                
                                {/* History Data Table */}
                                <table className="history-table w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Date</th>
                                            <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Sport</th>
                                            <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Week</th>
                                            <th className="bg-gray-800/50 text-white p-4 border border-gray-700">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                            <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                            <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                            <td className="bg-gray-800/30 text-gray-300 p-4 border border-gray-700">-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="picks-container bg-gradient-to-r from-gray-900 to-black text-white">
                                {/* History Button */}
                                <div className="history-button-container">
                                    <button 
                                        className={`history-button ${isHistoryActive ? 'active' : ''}`}
                                        onClick={handleHistoryClick}
                                    >
                                        History
                                    </button>
                                </div>

                                {/* Sport and Week Selection Dropdowns */}
                                <div className="picks-controls">
                                    <select className="select">
                                        <option value="">Select Sport</option>
                                        <option value="nfl">NFL</option>
                                        <option value="mlb">MLB</option>
                                        <option value="nba">NBA</option>
                                    </select>
                                    <select className="select">
                                        <option value="">Select Week</option>
                                        {[...Array(17)].map((_, i) => (
                                            <option key={i} value={i + 1}>Week {i + 1}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stats Summary Table */}
                                <table className="stats-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Performance</th>
                                            <th>Profit/ROI</th>
                                            <th>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>-</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Current Picks Display */}
                                <div className="picks-list">
                                    <h2 className="picks-subtitle">Picks</h2>
                                    <div className="picks-date">
                                        {weekStart && weekEnd && (
                                        <div className="text-md text-gray-600">
                                            {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} - {new Date(weekEnd).toLocaleDateString('en-US', { day: 'numeric' })}         
                                        </div>
                                        )}
                                        </div>
                                    
                                    {/* Placeholder picks will be replaced with real data */}
                                    {isSignedIn && userPicks.length > 0 ? (
                                        userPicks.map((pick, index) => {
                                        const teamDetails = getTeamDetails(pick.gameId, pick.teamIndex);
                                        if (!teamDetails) return null;

                                        return (
                                            <div key={index} className="pick-item">
                                            <div className="pick-details">
                                                <img src={teamDetails.logo} alt={teamDetails.name} className="team-logo" />
                                                <div>
                                                <div className="team-name">{teamDetails.name}</div>
                                                </div>
                                            </div>
                                            </div>
                                        );
                                        })
                                    ) : (
                                        <div className="message">No picks available. Please make your picks!</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add the auth container here */}
                <div className="auth-container bg-gradient-to-r from-gray-900 to-black text-white">
                    <h2 className="auth-title">New to TallySight?</h2>
                    <button 
                        onClick={() => router.push('/sign-up')}
                        className="sign-up-button"
                    >
                        Sign up
                    </button>
                    <button 
                        onClick={() => router.push('/sign-in')}
                        className="sign-in-button"
                    >
                        Log in
                    </button>
                </div>
            </div>

            <style jsx>{`
                .picks-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: black;
                    position: relative;
                }

                .history-button-container {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 10;
                }

                .history-button {
                    background-color: #3b82f6;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                .history-button:hover {
                    background-color: #2563eb;
                }

                .content-wrapper {
                    display: flex;
                    gap: 24px;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    max-width: 1200px;
                    margin-left: 200px;
                }

                .main-content {
                    max-width: 1000px;
                    width: 100%;
                }

                .picks-title {
                    font-size: 32px;
                    color: white;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .picks-container {
                    padding: 20px;
                    border-radius: 8px;
                    width: 100%;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .picks-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .select {
                    padding: 8px;
                    border-radius: 5px;
                    width: 48%;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .select option {
                    background-color: #1f2937;
                    color: white;
                }

                .stats-table {
                    width: 100%;
                    margin-bottom: 20px;
                    border-collapse: collapse;
                }

                .stats-table th {
                    background-color: rgba(255, 255, 255, 0.1);
                    padding: 12px;
                    text-align: left;
                    text-transform: uppercase;
                    font-size: 14px;
                    font-weight: bold;
                    color: white;
                }

                .stats-table td {
                    padding: 12px;
                    text-align: left;
                    background-color: rgba(255, 255, 255, 0.05);
                    color: white;
                }

                .stats-table td:first-child,
                .stats-table th:first-child {
                    text-align: center;
                }

                .stats-table td:last-child,
                .stats-table th:last-child {
                    text-align: right;
                }

                .stats-table tbody tr:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .picks-list {
                    text-align: left;
                }

                .picks-subtitle {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .picks-date {
                    color: #9ca3af;
                    margin-bottom: 20px;
                }

                .pick-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .pick-details {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .team-logo {
                    width: 40px;
                    height: 40px;
                }

                .team-name {
                    font-weight: bold;
                }

                .game-score {
                    color: #666;
                }

                .pick-result {
                    text-align: right;
                }

                .pick-result.win {
                    color: #2196f3;
                    font-weight: bold;
                }

                .pick-result.loss {
                    color: #f44336;
                    font-weight: bold;
                }

                .pick-result.w\\/l {
                    color: #2196f3;
                    font-weight: bold;
                }

                .history-button-container {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 10;
                }

                .history-button {
                    background-color: #3b82f6;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                .history-button:hover {
                    background-color: #2563eb;
                }

                .history-button.active {
                    background-color: #1565c0;
                }

                .message {
                    background-color: rgba(59, 130, 246, 0.1);
                    color: white;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 10px 0;
                    text-align: center;
                    font-weight: bold;
                }

                .history-title {
                    font-size: 24px;
                    margin: 40px 0 20px;
                    text-align: center;
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background: linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0));
                }

                .history-table th,
                .history-table td {
                    padding: 12px;
                    text-align: left;
                    border: 1px solid rgba(75, 85, 99, 0.4);
                }

                .history-table th {
                    background-color: rgba(31, 41, 55, 0.5);
                    font-weight: bold;
                    color: white;
                }

                .history-table tbody tr {
                    background-color: rgba(31, 41, 55, 0.3);
                }

                .history-table tbody tr:hover {
                    background-color: rgba(55, 65, 81, 0.4);
                }

                .auth-container {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 24px;
                    border-radius: 8px;
                    text-align: center;
                    width: 300px;
                    height: fit-content;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    margin-top: 50px;
                    align-self: center;
                }

                .auth-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: white;
                }

                .sign-up-button {
                    width: 100%;
                    padding: 12px;
                    background-color: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 16px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.2s;
                }

                .sign-up-button:hover {
                    background-color: #1d4ed8;
                }

                .sign-in-button {
                    width: 100%;
                    padding: 12px;
                    background-color: transparent;
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;
                }

                .sign-in-button:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
