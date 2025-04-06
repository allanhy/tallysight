"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React  from 'react';
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
                {/* Main leaderboard content - removed title */}
                <div className='main-content'>
                    <div className='leaderboard-container'>
                        <Leaderboard />
                    </div>
                </div>

                {!isSignedIn && (
                    <div className='auth-container'>
                        <h2 className='auth-title'>New to<br className="auth-break" />TallySight?</h2>
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
        </div>
    );
}