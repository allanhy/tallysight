'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

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

  const handleHistoryClick = () => {
    setIsHistoryActive(!isHistoryActive);
  };

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
        setGamesData(response.data.games);
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
            <h1 className="picks-title">My Picks</h1>
            {isHistoryActive ? (
                // History View Container
                <div className="picks-container">
                    {/* History Button */}
                    <div className="history-button-container">
                        <button 
                            className={`history-button ${isHistoryActive ? 'active' : ''}`}
                            onClick={handleHistoryClick}
                        >
                            History
                        </button>
                    </div>
                    
                    <h2 className="history-title">History</h2>
                    
                    {/* History Data Table */}
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Sport</th>
                                <th>Week</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        {/* Placeholder data rows */}
                        <tbody>
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                // Normal View Container
                <div className="picks-container">
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
                                {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} - 
                                {new Date(weekEnd).toLocaleDateString('en-US', { day: 'numeric' })}         
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
             <style jsx>{`
                .picks-page {
                    position: relative;
                    background-color: #000;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: #fff;
                }

                .picks-title {
                    font-size: 32px;
                    margin-bottom: 20px;
                }

                .picks-container {
                    padding: 20px;
                    background-color: #f7f7f7;
                    color: #000;
                    max-width: 800px;
                    width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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
                }

                .stats-table {
                    width: 100%;
                    margin-bottom: 20px;
                    border-collapse: collapse;
                }

                .stats-table th, .stats-table td {
                    padding: 12px;
                    text-align: center;
                    border: 1px solid #e0e0e0;
                }

                .stats-table th {
                    background-color: #e0e0e0;
                    font-weight: bold;
                }

                .picks-list {
                    text-align: left;
                }

                .picks-subtitle {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .picks-date {
                    color: #666;
                    margin-bottom: 20px;
                }

                .pick-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #e0e0e0;
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
                }

                .history-button {
                    background-color: ${isHistoryActive ? '#1976d2' : '#2196f3'};
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.2s;
                }

                .history-button:hover {
                    background-color: #1976d2;
                }

                .history-button.active {
                    background-color: #1565c0;
                }

                .message {
                    background-color: #e3f2fd;
                    color: #1976d2;
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
                }

                .history-table th,
                .history-table td {
                    padding: 12px;
                    text-align: left;
                    border: 1px solid #e0e0e0;
                }

                .history-table th {
                    background-color: #e0e0e0;
                    font-weight: bold;
                }

                .history-table tbody tr:hover {
                    background-color: #f5f5f5;
                }
            `}</style>
        </div>
    );
}
