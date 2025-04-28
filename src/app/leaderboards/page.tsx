"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React  from 'react';
import { useRouter } from 'next/navigation';
import Leaderboard from '../components/leaderboard';
import { useUser } from '@clerk/nextjs';
import BackToTop from '@/app/components/BackToTop'; 

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
            <style jsx>{`
                .leaderboard-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .content-wrapper {
                    display: flex;
                    flex-direction: row;
                    gap: 24px;
                    justify-content: space-between;
                    align-items: flex-start;
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 16px;
                }

                .content-wrapper.centered {
                    justify-content: center;
                }

                .main-content {
                    flex: 1;
                    max-width: 1000px;
                }

                .leaderboard-container {
                    width: 100%;
                }

                .auth-container {
                    background: rgb(17, 24, 39);
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    width: 250px;
                    height: fit-content;
                    flex-shrink: 0;
                    align-self: flex-start;
                    margin-top: 0;
                }

                .auth-title {
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }

                .auth-break {
                    display: block;
                    margin-top: 0.4rem;
                    margin-bottom: 0.2rem;
                }

                .tallysight-text {
                    display: block;
                    margin-top: 0.5rem;
                }

                .sign-up-button, .sign-in-button {
                    margin-top: 16px;
                    padding: 14px 20px;
                    color: white;
                    background-color: #0066FF;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    width: 100%;
                    font-size: 1rem;
                    font-weight: 700;
                }

                .sign-up-button {
                    margin-top: 0;
                }

                .sign-in-button {
                    margin-top: 16px;
                }

                .sign-up-button:hover, .sign-in-button:hover {
                    background-color: #0052cc;
                }

                @media (max-width: 768px) {
                    .content-wrapper {
                        flex-direction: column;
                    }

                    .auth-container {
                        width: 100%;
                        max-width: 1000px;
                        margin-top: 20px;
                    }
                }
            `}</style>
           <BackToTop />
        </div>
        
    );
}