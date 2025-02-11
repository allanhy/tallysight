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
                <div className='leaderboard-container'>
                    <Leaderboard />
                </div>
                {/* This container will be positioned next to the leaderboard on larger screens */}
                {!isSignedIn && (
                <div className='auth-container'>
                    <h2 className='auth-title'>New to TallySight?</h2>
                    <button 
                        onClick={handleSignUp}
                        className='sign-up-button'
                    >
                        Sign up
                    </button>
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
                    flex-direction: column; /* Stack elements vertically on small screens */
                    gap: 24px;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    max-width: 1200px;
                }

                .leaderboard-container {
                    width: 100%; /* Ensure the leaderboard takes full width */
                    max-width: 1000px; /* Limit max width for larger screens */
                    margin-bottom: 0; /* Remove margin to allow stacking */
                }

                .auth-container {
                    background: linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0));
                    padding: 24px;
                    border-radius: 8px;
                    text-align: center;
                    width: 300px; /* Default width for larger screens */
                    height: fit-content;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    margin-top: 20px; /* Adjust margin for better spacing */
                    align-self: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .sign-up-button, .sign-in-button {
                    margin-top: 10px; /* Add some space between buttons */
                    padding: 10px 20px; /* Add padding for better button size */
                    color: white; /* Button text color */
                    background-color: #0070f3; /* Button background color */
                    border: none; /* Remove default border */
                    border-radius: 5px; /* Rounded corners */
                    cursor: pointer; /* Pointer cursor on hover */
                }

                .sign-up-button:hover, .sign-in-button:hover {
                    background-color: #005bb5; /* Darker shade on hover */
                }

                @media (min-width: 769px) {
                    .content-wrapper {
                        flex-direction: row; /* Align elements side by side on larger screens */
                        justify-content: space-between; /* Space between leaderboard and auth container */
                    }

                    .auth-container {
                        margin-top: 0; /* Remove top margin when side by side */
                    }
                }

                @media (max-width: 768px) {
                    .content-wrapper {
                        flex-direction: column; /* Ensure vertical stacking on small screens */
                    }

                    .auth-container {
                        width: 100%; /* Make auth container full width on small screens */
                        max-width: 1000px; /* Match the leaderboard container width */
                        padding: 16px;
                        margin-top: 20px; /* Adjust margin for better spacing */
                    }
                }

                @media (max-width: 480px) {
                    .auth-container {
                        width: 100%; /* Make auth container full width on very small screens */
                    }
                }
            `}</style>
        </div>
    );
}