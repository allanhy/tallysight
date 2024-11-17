"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    return (
        <div className="leaderboard-page">
            <div className="content-wrapper">
                <div className="main-content">
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
                </div>

                <div className="auth-container">
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
                .leaderboard-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: black;
                    position: relative;
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

                .leaderboard-title {
                    font-size: 32px;
                    color: white;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .leaderboard-container {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 100%;
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

                .auth-container {
                    background: #f7f7f7;
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
                    color: #000;
                }

                .sign-up-button {
                    width: 100%;
                    padding: 12px;
                    background-color: #3b82f6;
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
                    background-color: #2563eb;
                }

                .sign-in-button {
                    width: 100%;
                    padding: 12px;
                    background-color: transparent;
                    color: #3b82f6;
                    border: 2px solid #3b82f6;
                    border-radius: 4px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;
                }

                .sign-in-button:hover {
                    background-color: rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </div>
    );
}