/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import './header.css'
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, SignUpButton, useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext';
import CarouselWithGames from './carouselWithGames';
import { usePathname } from 'next/navigation';
import { useSport } from '@/context/SportContext';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/dropdown-menu";
import { Loader2, LogOut, RefreshCw, Settings } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoaded, isSignedIn, user } = useUser();
    const [points, setPoints] = useState<number | null>(null);
    const [loadingPoints, setLoadingPoints] = useState(true);
    const [error, setError] = useState('');
    const { carouselSport, setCarouselSport, selectedSoccerLeague } = useSport();
    const [refreshCarousel, setRefreshCarousel] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { theme } = useTheme();
    const pathname = usePathname();
    const { signOut } = useClerk();

    const handleSportChange = (sport: string) => {
        if (sport === 'Soccer') {
            setCarouselSport(selectedSoccerLeague === '' ? 'Soccer' : selectedSoccerLeague);  // Show all soccer leagues
        } else {
            setCarouselSport(sport);
        }
    };

    useEffect(() => {
        const getPoints = async () => {
            try {
                if (!isLoaded || !isSignedIn || !user?.id) return;

                setLoadingPoints(true);

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
            } finally {
                setLoadingPoints(false);
            }
        }

        getPoints();
    }, [isLoaded, isSignedIn, user?.id]);

    const handleRefreshClick = () => {
        setRefreshing(true);
        setRefreshCarousel(prev => !prev); // Toggle boolean to trigger re-render
    };

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
                                    onClick={() => setIsMenuOpen(false)}
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
                                        <SignInButton mode='redirect'>
                                            <button className='flex justify-end p-3 text-black rounded-lg bg-white text-black border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:scale-105'>
                                                Log in
                                            </button>
                                        </SignInButton>
                                        <div className='flex justify-end p-3 text-white rounded-lg bg-[#008AFF] hover:scale-105'>
                                            <SignUpButton mode="redirect" />
                                        </div>
                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div className='flex justify-end p-3'>
                                        {!user || !user.imageUrl ? (
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                        ) : (
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex items-center gap-2 focus:outline-none active:outline-none active:ring-0 focus:ring-0">
                                                        <Image
                                                            src={user.imageUrl}
                                                            alt="User profile"
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full"
                                                        />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50 p-2`}
                                                >
                                                    <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 cursor-default select-none hover:bg-transparent focus:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent">
                                                        <div className="flex items-center gap-2">
                                                            {!user.imageUrl ? (
                                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                            ) : (
                                                                <Image
                                                                    src={user.imageUrl}
                                                                    alt="User profile"
                                                                    width={30}
                                                                    height={30}
                                                                    className="rounded-full"
                                                                />
                                                            )}
                                                            <div className='pl-2'>
                                                                <div className="font-bold">{user.fullName}</div>
                                                                <div className="text-s text-gray-500 dark:text-gray-400">@{user.username}</div>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <hr className="border-gray-300 dark:border-gray-600 my-1" />
                                                    <DropdownMenuItem asChild
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Link href="/profile" ><Settings />Manage Account</Link>
                                                    </DropdownMenuItem>
                                                    <hr className="border-gray-300 dark:border-gray-600 my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => signOut({ redirectUrl: '/' })}
                                                        className="cursor-pointer"
                                                    >
                                                        <LogOut /> Sign out
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}

                                        {/*show user points*/}
                                        <div className="hidden md:flex ml-10 space-x-8 font-montserrat font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-2">
                                            Points:&nbsp;
                                            {loadingPoints ? (
                                                <Loader2 className="animate-spin h-5 w-5 text-gray-600 dark:text-gray-300" />
                                            ) : (
                                                <span>{points}</span>
                                            )}
                                        </div>
                                    </div>
                                </SignedIn>
                            </div>

                            {/* Mobile Auth - Moved outside hamburger menu */}
                            <div className="md:hidden flex items-center">
                                <SignedIn>
                                    <div className='flex items-center gap-2'>
                                        {!user || !user.imageUrl ? (
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                        ) : (
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex items-center gap-2 focus:outline-none active:outline-none active:ring-0 focus:ring-0">
                                                        <Image
                                                            src={user.imageUrl}
                                                            alt="User profile"
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full"
                                                        />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    side="bottom"
                                                    align="end"
                                                    className={`mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 p-2`}
                                                >
                                                    <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 cursor-default select-none hover:bg-transparent focus:bg-transparent">
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={user.imageUrl}
                                                                alt="User profile"
                                                                width={30}
                                                                height={30}
                                                                className="rounded-full"
                                                            />
                                                            <div className='pl-2'>
                                                                <div className="font-bold">{user.fullName}</div>
                                                                <div className="text-s text-gray-500 dark:text-gray-400">@{user.username}</div>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <hr className="border-gray-300 dark:border-gray-700 my-1" />
                                                    <DropdownMenuItem asChild onClick={() => setIsMenuOpen(false)}>
                                                        <Link href="/profile"> <Settings /> Manage Account</Link>
                                                    </DropdownMenuItem>
                                                    <hr className="border-gray-300 dark:border-gray-700 my-1" />
                                                    <DropdownMenuItem onClick={() => signOut({ redirectUrl: '/' })}>
                                                        <LogOut /> Sign out
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                        {/*show user points*/}
                                        <div className="font-montserrat font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600">
                                            Points: {points}
                                        </div>
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
                        </div>
                    </div>
                </div>
            </nav>
            {pathname !== '/profile' && (
                <div className="pt-20">
                    <div className="max-w-7xl mx-auto px-4 pl-4 flex items-center gap-2">
                        <select
                            value={carouselSport}
                            onChange={(e) => handleSportChange(e.target.value)}
                            className="px-2 py-2 mx-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                        >
                            <option value="" disabled>Select Sport</option>
                            <option value="NBA">NBA</option>
                            <option value="NFL">NFL</option>
                            <option value="MLB">MLB</option>
                            <option value="NHL">NHL</option>

                            <optgroup label="Soccer" className='pt-2 pb-2 font-bold'>
                                <option value="Soccer">All Soccer Leagues</option>
                                <option value="MLS">MLS</option>
                                <option value="EPL">English Premier League</option>
                                <option value="LALIGA">La Liga</option>
                                <option value="BUNDESLIGA">Bundesliga</option>
                                <option value="SERIE_A">Serie A</option>
                                <option value="LIGUE_1">Ligue 1</option>
                            </optgroup>
                        </select>
                        <button
                            onClick={handleRefreshClick}
                            disabled={refreshing}
                            className="p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Refresh Games"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <CarouselWithGames refreshKey={refreshCarousel} onDataLoaded={() => setRefreshing(false)}/>
                </div>
            )}
            {pathname === '/profile' && (
                <div className="py-10" />
            )}
        </div>
    );
};

export default Header;

