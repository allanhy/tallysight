"use client";

import React from 'react';

export default function Page() {
    return (
        <div className="leaderboard-page">
            <h1 className="leaderboard-title">Leaderboard</h1>
            <div className="leaderboard-container">
                <div className="leaderboard-controls">
                    <select className="select">
                        <option>Select Sport</option>
                        <option>NFL</option>
                        <option>MLB</option>
                        <option>NBA</option>
                    </select>
                    <select className="select">
                        <option>Select Week</option>
                        <option>Week 1</option>
                        <option>Week 2</option>
                        <option>Week 3</option>
                    </select>
                </div>

                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Performance</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(4)].map((_, i) => (
                            <tr key={i}><td>-</td><td>---</td><td>---</td><td>---</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .leaderboard-page {
                    background-color: #000;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: #fff;
                }

                .leaderboard-title {
                    font-size: 32px;
                    margin-bottom: 20px;
                }

                .leaderboard-container {
                    text-align: center;
                    padding: 20px;
                    background-color: #f7f7f7;
                    color: #000;
                    max-width: 800px;
                    width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                .leaderboard-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .select {
                    padding: 8px;
                    border-radius: 5px;
                    width: 48%;
                }

                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .leaderboard-table th, .leaderboard-table td {
                    padding: 12px;
                    text-align: left;
                }

                .leaderboard-table th {
                    background-color: #e0e0e0;
                    text-transform: uppercase;
                    font-size: 14px;
                }

                .leaderboard-table td {
                    background-color: #f7f7f7;
                }

                .leaderboard-table tbody tr:hover {
                    background-color: #eaeaea;
                }

                .leaderboard-table td:first-child, .leaderboard-table th:first-child {
                    text-align: center;
                }

                .leaderboard-table td:last-child, .leaderboard-table th:last-child {
                    text-align: right;
                }
            `}</style>
        </div>
    );
}