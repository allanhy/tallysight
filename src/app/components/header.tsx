"use client";


import './header.css'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link'
import NavLink from './nav-link'
import { useState } from 'react';


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    return (
        <nav className="sticky top-0">
        <div className='flex items-center justify-between w-full'>
            <div className='flex items-center space-x-8 pl-10 pt-1'>
                <Link href='/home'>
                    <Image src="/TallySight.png"
                           alt="TallySight Logo"
                           width={150}
                           height={100}
                           quality={100}
                           className='m1-16'/>
                </Link>
                {/* Desktop Navigation */}
                <ul className='hidden md:flex'>
                    <li><NavLink href='/leaderboards'>Leaderboards</NavLink></li>
                    <li><NavLink href='/contests'>Contests</NavLink></li>
                    <li><NavLink href='/quickPicks'>Quick Picks</NavLink></li>
                </ul>
            </div>


            {/* Auth Buttons */}
            <div className='hidden md:block'>
                <div className='mr-4 pt-2'>
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


                {/* Hamburger Menu Button */}
                <button
                    className='md:hidden mr-4 text-white'
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {!isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </button>
            </div>
           
            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className='md:hidden mobile-menu'>
                    <ul className='flex flex-col'>
                        <li><NavLink href='/leaderboards' onClick={() => setIsMenuOpen(false)}>Leaderboards</NavLink></li>
                        <li><NavLink href='/contests' onClick={() => setIsMenuOpen(false)}>Contests</NavLink></li>
                        <li><NavLink href='/quickPicks' onClick={() => setIsMenuOpen(false)}>Quick Picks</NavLink></li>
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

