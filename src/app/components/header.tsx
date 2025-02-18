'use client';

import './header.css'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link'
import NavLink from './nav-link'
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const { theme } = useTheme();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    {/* Left side: Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0">
                            <Image
                                src={theme === 'dark' ? "/Tallysight.png" : "/TallysightDark.png"}
                                alt="Tallysight"
                                width={120}
                                height={32}
                                priority
                            />
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex ml-10 space-x-8">
                            <Link 
                                href="/leaderboards"
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"
                            >
                                Leaderboards
                            </Link>
                            <Link 
                                href="/contests"
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"
                            >
                                Contests
                            </Link>
                            <Link 
                                href="/myPicks"
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2"
                            >
                                My Picks
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Profile */}
                    <div className="flex items-center">
                        <SignedOut>
                            <div className='flex justify-end p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                                <SignInButton />
                            </div>
                        </SignedOut>
                        <SignedIn>
                            <div className='flex justify-end p-3'>
                                <UserButton userProfileUrl='/profile'/>
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </div>
           
            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className='md:hidden mobile-menu'>
                    <ul className='flex flex-col'>
                        <li><NavLink href='/leaderboards' onClick={() => setIsMenuOpen(false)}>Leaderboards</NavLink></li>
                        <li><NavLink href='/contests' onClick={() => setIsMenuOpen(false)}>Contests</NavLink></li>
                        <li><NavLink href='/my-picks' onClick={() => setIsMenuOpen(false)}>My Picks</NavLink></li>
                        <li className='mobile-auth'>
                            <SignedOut>
                                <div className='p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                                    <SignInButton />
                                </div>
                            </SignedOut>
                            <SignedIn>
                                <div className='p-3'>
                                    <UserButton userProfileUrl='/profile'/>
                                </div>
                            </SignedIn>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Header;

