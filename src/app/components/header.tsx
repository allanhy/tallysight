'use client';

import React, { useState } from 'react';
import './header.css'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext';
import CarouselWithGames from './carouselWithGames';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme } = useTheme();

    return (
        <div>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        {/* Left side: Logo and Desktop Navigation */}
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0">
                                <Image
                                    src={theme === 'dark' ? "/TallySight.png" : "/TallysightDark.png"}
                                    alt="Tallysight"
                                    width={120}
                                    height={32}
                                    priority
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
                                    <div className='flex justify-end p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                                        <SignInButton mode="redirect"/>
                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div className='flex justify-end p-3'>
                                        <UserButton userProfileUrl='/profile' />
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
                            {/*
                            <Link 
                                href="/contests" 
                                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contests
                            </Link>
                            */}
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
                                    <div className='p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                                        <SignInButton mode="redirect"/>
                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div className='p-3'>
                                        <UserButton userProfileUrl='/profile' />
                                    </div>
                                </SignedIn>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>     
            <div className="pt-10">
                <CarouselWithGames/>
            </div>   
        </div>        
    );
};

export default Header;

