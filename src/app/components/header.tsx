/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import './header.css'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext';
import CarouselWithGames from './carouselWithGames';
import { usePathname } from 'next/navigation';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoaded, isSignedIn, user } = useUser();
    const [points, setPoints] = useState<number | null>(null);
    const [error, setError] = useState('');
    const { theme } = useTheme();
    const pathname = usePathname();
    const [selectedSport, setSelectedSport] = useState('NBA');

    const handleSportChange = (sport: string) => {
        setSelectedSport(sport);
    };

    useEffect(() => {
        const getPoints = async () => {
            try {
                if (!isLoaded || !isSignedIn || !user?.id) return;

                // Getting User points
                const res = await fetch(`/api/user/getPoints?clerk_id=${user.id}`);
                const points = await res.json();

                if (res.ok) {
                    setPoints(points.data);
                } else {
                    setError(points.message || "Failed to get user points");
                }

            } catch (error) {
                setError(`Network error fetching user points: ${error}`);
            }
        }

        getPoints();
    }, [isLoaded, isSignedIn, user?.id]);

    return (
        <div>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        {/* Left side: Logo and Desktop Navigation */}
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0">
                                <Image
                                    src={theme === 'dark' ? "/TallySight.png" : "https://cdn.prod.website-files.com/62e979d60820e0255f5b19dd/62e99bac66e670659812115e_ts-logo-horizontal-b-p-500.png"}
                                    alt="Tallysight"
                                    width={150}
                                    height={40}
                                    priority
                                    className="object-contain"
                                />
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex ml-10 space-x-8 font-montserrat font-semibold">
                                <Link href="/leaderboards" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2">
                                    Leaderboards
                                </Link>
                                {/*
                                <Link href="/contests" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2">
                                    Contests
                                </Link>
                                */}
                                <Link href="/myPicks" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2">
                                    My Picks
                                </Link>
                            </div>
                        </div>

                        {/* Right side: Auth and Hamburger */}
                        <div className="flex items-center">
                            {/* Desktop Auth */}
                            <div className="hidden md:block">
                                <SignedOut>
                                    <div className='flex gap-2'>
                                        <div className='flex justify-end p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                                            <SignUpButton mode="redirect" />
                                        </div>
                                        <div className='flex justify-end p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                                            <SignInButton mode="redirect" />
                                        </div>
                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div className='flex justify-end p-3'>
                                        <UserButton userProfileUrl='/profile' />
                                        {/*show user points*/}
                                        <div className="hidden md:flex ml-10 space-x-8 font-montserrat font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-2"> Points: {points}</div>
                                    </div>
                                </SignedIn>
                            </div>

                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 ml-2 text-gray-600 dark:text-gray-300"
                                aria-label="Toggle menu"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {isMenuOpen ? (
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                href="/leaderboards"
                                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Leaderboards
                            </Link>
                            <Link
                                href="/myPicks"
                                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                My Picks
                            </Link>
                            {/* Mobile Auth */}
                            <div className="mt-4">
                                <SignedOut>
                                    <div className='space-y-2'>
                                        <SignUpButton mode='redirect'>
                                            <button className='p-3 text-white rounded-lg bg-[#008AFF] block w-full hover:scale-105'>
                                                Sign up
                                            </button>
                                        </SignUpButton>
                                        <SignInButton mode='redirect'>
                                            <button className='p-3 text-white rounded-lg bg-[#008AFF] block w-full hover:scale-105'>
                                                Sign in
                                            </button>
                                        </SignInButton>
                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div className='p-3'>
                                        <UserButton userProfileUrl='/profile' />
                                        {/*show user points*/}
                                        <div className="font-montserrat font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 py-2"> Points: {points}</div>
                                    </div>
                                </SignedIn>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {pathname !== '/profile' && (
                <div className="pt-20">
                    <div className="max-w-7xl mx-auto px-4 pl-4">
                        <select
                            value={selectedSport}
                            onChange={(e) => handleSportChange(e.target.value)}
                            className="px-2 py-2 mx-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                        >
                            <option value="" disabled>Select Sport</option>
                            <option value="NBA">NBA</option>
                            <option value="NFL">NFL</option>
                            <option value="MLB">MLB</option>
                            <option value="NHL">NHL</option>

                            <optgroup label="Soccer" className='pt-2 pb-2 font-bold'>
                                <option value="MLS">MLS</option>
                                <option value="EPL">English Premier League</option>
                                <option value="LALIGA">La Liga</option>
                                <option value="BUNDESLIGA">Bundesliga</option>
                                <option value="SERIE_A">Serie A</option>
                                <option value="LIGUE_1">Ligue 1</option>
                            </optgroup>
                        </select>
                    </div>
                    <CarouselWithGames selectedSport={selectedSport} />
                </div>
            )}
            {pathname === '/profile' && (
                <div className="py-10" />
            )}
        </div>
    );
};

export default Header;

