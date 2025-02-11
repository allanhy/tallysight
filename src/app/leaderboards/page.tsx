"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect }  from 'react';
import { useRouter } from 'next/navigation';
import Leaderboard from '../components/leaderboard';
import { useUser } from '@clerk/nextjs';
//import '../styles/leaderboard.css';

export default function Page() {
    const router = useRouter();
    const { isSignedIn } = useUser();

    // Navigation: Redirects user to sign-in page
    const handleSignIn = async () => {
        if (!isSignedIn) {
            const returnUrl = window.location.pathname;
            router.push(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`); // Update this path to match your sign-in page route
            return;
        }
    };

    const handleSignUp = async () => {
        if (!isSignedIn) {
            const returnUrl = window.location.pathname;
            router.push(`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`); // Update this path to match your sign-in page route
            return;
        }
    };

    

    return (
        <div className='leaderboard-page'>
            <div className={`content-wrapper ${isSignedIn ? 'centered' : ''}`}>
                <Leaderboard></Leaderboard>
                {!isSignedIn && (
                <div className='auth-container'>
                    <h2 className='auth-title'>New to TallySight?</h2>
                    <button 
                        onClick={handleSignUp}
                        className='sign-up-button'
                    >
                        Sign up
                    </button>
                    <div className='text-white'>or</div>
                    <button 
                        onClick={handleSignIn}
                        className='sign-in-button'
                    >
                        Log in
                    </button>
                </div>
                )}
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
                }

                .content-wrapper.centered {
                    justify-content: center;
                }

                .main-content {
                    max-width: 1000px;
                    width: 100%;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }

                .auth-container {
                    background: linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0));
                    padding: 24px;
                    border-radius: 8px;
                    text-align: center;
                    width: 300px;
                    height: fit-content;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    margin-top: 50px;
                    align-self: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .auth-title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: white;
                }

                .sign-up-button {
                    width: 100%;
                    padding: 10em;
                    background-color: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 16px;
                    margin-bottom: 1em;
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
            }
                
            @media (max-width: 768px) {
                .content-wrapper {
                    flex-direction: row;
                    align-items: center;
                    gap: 16px;
                    padding: 10px;
                }

                .leaderboard-container {
                    padding: 16px;
                    width: 90%;
                }

                .leaderboard-title {
                    font-size: 24px;
                }

                .leaderboard-controls {
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                }

                .leaderboard-header{
                    font-size: 1px;
                    gap: 10px;
                }

                .select {
                    width: 100%;
                }

                .auth-container {
                    width: 90%;
                    max-width: 350px;
                    padding: 16px;
                }
                    
                .sign-up-button,
                .sign-in-button {
                    font-size: 14px;
                    padding: 10px;
                }
            }

            @media (max-width: 480px) {
                .auth-container {
                    padding: 12px;
                    width: 95%;
                }
                .sign-up-button,
                .sign-in-button {
                    font-size: 14px;
                    padding: 8px;
                }
                
            `}</style>
        </div>
    );
}