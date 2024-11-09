'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function MyPicksPage() {
    // State to track if history view is active
    const [isHistoryActive, setIsHistoryActive] = useState(false);

    // Toggle between history and normal view
    const handleHistoryClick = () => {
        setIsHistoryActive(!isHistoryActive);
    };

    const placeholderPicks = [
        {
            team: 'LA Dodgers',
            score: '',
            result: 'Win',
            logo: '/dodgers-logo.png'
        },
        {
            team: 'Padres',
            score: '',
            result: 'Loss',
            logo: '/padres-logo.png'
        },
        {
            team: 'Diamondbacks',
            score: '',
            result: 'W/L',
            logo: '/dbacks-logo.png'
        }
    ];

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
                        <div className="picks-date">-</div>
                        
                        {/* Placeholder picks will be replaced with real data */}
                        {placeholderPicks.map((pick, index) => (
                            <div key={index} className="pick-item">
                                <div className="pick-details">
                                    <img src={pick.logo} alt={pick.team} className="team-logo" />
                                    <div>
                                        <div className="team-name">{pick.team}</div>
                                    </div>
                                </div>
                                <div className={`pick-result ${pick.result.toLowerCase()}`}>
                                    <div>{pick.result}</div>
                                </div>
                            </div>
                        ))}
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
