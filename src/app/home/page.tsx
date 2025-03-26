/* Currently the home page, keeping this saved in case we decide to go back to having a specific contest page. -JA */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../components/ui/skeleton';

interface Game {
    id: string;
    homeTeam: {
        name: string;
        score: number | null;
        spread: string;
    };
    awayTeam: {
        name: string;
        score: number | null;
        spread: string;
    };
    gameTime: string;
    status: string;
}

export default function ContestsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [nbaTodayGames, setNbaTodayGames] = useState<Game[]>([]);
    const [nbaTomorrowGames, setNbaTomorrowGames] = useState<Game[]>([]);
    const [mlbTomorrowGames, setMlbTomorrowGames] = useState<Game[]>([]);
    const [mlbTodayGames, setMlbTodayGames] = useState<Game[]>([]);
    const [nflTodayGames, setNflTodayGames] = useState<Game[]>([]);
    const [nflTomorrowGames, setNflTomorrowGames] = useState<Game[]>([]);
    const [nhlTodayGames, setNhlTodayGames] = useState<Game[]>([]);
    const [nhlTomorrowGames, setNhlTomorrowGames] = useState<Game[]>([]);
    const [mlsTodayGames, setMlsTodayGames] = useState<Game[]>([]);
    const [mlsTomorrowGames, setMlsTomorrowGames] = useState<Game[]>([]);
    const [eplTodayGames, setEplTodayGames] = useState<Game[]>([]);
    const [eplTomorrowGames, setEplTomorrowGames] = useState<Game[]>([]);
    const [laligaTodayGames, setLaligaTodayGames] = useState<Game[]>([]);
    const [laligaTomorrowGames, setLaligaTomorrowGames] = useState<Game[]>([]);
    const [bundesligaTodayGames, setBundesligaTodayGames] = useState<Game[]>([]);
    const [bundesligaTomorrowGames, setBundesligaTomorrowGames] = useState<Game[]>([]);
    const [serieaTodayGames, setSerieaTodayGames] = useState<Game[]>([]);
    const [serieaTomorrowGames, setSerieaTomorrowGames] = useState<Game[]>([]);
    const [ligue1TodayGames, setLigue1TodayGames] = useState<Game[]>([]);
    const [ligue1TomorrowGames, setLigue1TomorrowGames] = useState<Game[]>([]);

    const [selectedSport, setSelectedSport] = useState<'NBA' | 'MLB' | 'NFL' | 'NHL' | 'Soccer'>('NBA');
    const [selectedSoccerLeague, setSelectedSoccerLeague] = useState<string | null>(null);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const [
                    nbaTodayResponse, mlbTodayResponse, nflTodayResponse, nhlTodayResponse,
                    mlsTodayResponse, eplTodayResponse, laligaTodayResponse, bundesligaTodayResponse, serieaTodayResponse, ligue1TodayResponse,
                    nbaTomorrowResponse, mlbTomorrowResponse, nflTomorrowResponse, nhlTomorrowResponse,
                    mlsTomorrowResponse, eplTomorrowResponse, laligaTomorrowResponse, bundesligaTomorrowResponse, serieaTomorrowResponse, ligue1TomorrowResponse,
                ] = await Promise.all([
                    fetch('/api/all-espn-games?sport=NBA&day=today'),
                    fetch('/api/all-espn-games?sport=MLB&day=today'),
                    fetch('/api/all-espn-games?sport=NFL&day=today'),
                    fetch('/api/all-espn-games?sport=NHL&day=today'),
                    fetch('/api/all-espn-games?sport=MLS&day=today'),
                    fetch('/api/all-espn-games?sport=EPL&day=today'),
                    fetch('/api/all-espn-games?sport=LALIGA&day=today'),
                    fetch('/api/all-espn-games?sport=BUNDESLIGA&day=today'),
                    fetch('/api/all-espn-games?sport=SERIE_A&day=today'),
                    fetch('/api/all-espn-games?sport=LIGUE_1&day=today'),


                    fetch('/api/all-espn-games?sport=NBA&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=MLB&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=NFL&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=NHL&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=MLS&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=EPL&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=LALIGA&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=BUNDESLIGA&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=SERIE_A&day=tomorrow'),
                    fetch('/api/all-espn-games?sport=LIGUE_1&day=tomorrow'),
                ]);

                const [
                    nbaTodayData, mlbTodayData, nflTodayData, nhlTodayData,
                    mlsTodayData, eplTodayData, laligaTodayData, bundesligaTodayData, serieaTodayData, ligue1TodayData,
                    nbaTomorrowData, mlbTomorrowData, nflTomorrowData, nhlTomorrowData,
                    mlsTomorrowData, eplTomorrowData, laligaTomorrowData, bundesligaTomorrowData, serieaTomorrowData, ligue1TomorrowData,
                ] = await Promise.all([
                    nbaTodayResponse.json(), mlbTodayResponse.json(), nflTodayResponse.json(), nhlTodayResponse.json(),
                    mlsTodayResponse.json(), eplTodayResponse.json(), laligaTodayResponse.json(), bundesligaTodayResponse.json(), serieaTodayResponse.json(), ligue1TodayResponse.json(),
                    nbaTomorrowResponse.json(), mlbTomorrowResponse.json(), nflTomorrowResponse.json(), nhlTomorrowResponse.json(),
                    mlsTomorrowResponse.json(), eplTomorrowResponse.json(), laligaTomorrowResponse.json(), bundesligaTomorrowResponse.json(), serieaTomorrowResponse.json(), ligue1TomorrowResponse.json()
                ]);

                setNbaTodayGames(nbaTodayData.games);
                setNbaTomorrowGames(nbaTomorrowData.games);
                setMlbTodayGames(mlbTodayData.games);
                setMlbTomorrowGames(mlbTomorrowData.games);
                setNflTodayGames(nflTodayData.games);
                setNflTomorrowGames(nflTomorrowData.games);
                setNhlTodayGames(nhlTodayData.games);
                setNhlTomorrowGames(nhlTomorrowData.games);

                // Soccer League Games
                setMlsTodayGames(mlsTodayData.games);
                setMlsTomorrowGames(mlsTomorrowData.games);
                setEplTodayGames(eplTodayData.games);
                setEplTomorrowGames(eplTomorrowData.games);
                setLaligaTodayGames(laligaTodayData.games);
                setLaligaTomorrowGames(laligaTomorrowData.games);
                setBundesligaTodayGames(bundesligaTodayData.games);
                setBundesligaTomorrowGames(bundesligaTomorrowData.games);
                setSerieaTodayGames(serieaTodayData.games);
                setSerieaTomorrowGames(serieaTomorrowData.games);
                setLigue1TodayGames(ligue1TodayData.games);
                setLigue1TomorrowGames(ligue1TomorrowData.games);
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const renderTodayGames = () => {
        switch (selectedSport) {
            case 'NBA': return nbaTodayGames;
            case 'MLB': return mlbTodayGames;
            case 'NFL': return nflTodayGames;
            case 'NHL': return nhlTodayGames;
            case 'Soccer':
            switch (selectedSoccerLeague) {
                case 'MLS': return mlsTodayGames;
                case 'EPL': return eplTodayGames;
                case 'LALIGA': return laligaTodayGames;
                case 'BUNDESLIGA': return bundesligaTodayGames;
                case 'SERIE_A': return serieaTodayGames;
                case 'LIGUE_1': return ligue1TodayGames;
                default: return [];
            }
            default: return [];
        }
    };

    const renderTomorrowGames = () => {
        switch (selectedSport) {
            case 'NBA': return nbaTomorrowGames;
            case 'MLB': return mlbTomorrowGames;
            case 'NFL': return nflTomorrowGames;
            case 'NHL': return nhlTomorrowGames;
            case 'Soccer':
            switch (selectedSoccerLeague) {
                case 'MLS': return mlsTomorrowGames;
                case 'EPL': return eplTomorrowGames;
                case 'LALIGA': return laligaTomorrowGames;
                case 'BUNDESLIGA': return bundesligaTomorrowGames;
                case 'SERIE_A': return serieaTomorrowGames;
                case 'LIGUE_1': return ligue1TomorrowGames;
                default: return [];
            }
            default: return [];
        }
    };

    const handleTodayPlayNow = () => {
        const query = selectedSport === 'Soccer' && selectedSoccerLeague
            ? `sport=${selectedSoccerLeague}`
            : `sport=${selectedSport}`;
        router.push(`/daily-picks?${query}`);
    };

    const handleTomorrowPlayNow = () => {
        const query = selectedSport === 'Soccer' && selectedSoccerLeague
            ? `sport=${selectedSoccerLeague}`
            : `sport=${selectedSport}`;
        router.push(`/tomorrow-picks?${query}`);
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-8 min-h-screen">
                <h1 className="text-black dark:text-white font-semibold mb-4 text-center" style={{ letterSpacing: '1.5px', fontSize: '65px' }}>
                    Contests
                </h1>
                {/* Skeleton Loader for Buttons */}
                <div className="flex gap-4 mb-6 overflow-x-auto whitespace-nowrap scrollbar w-full sm:justify-center">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg w-24 text-center animate-pulse"
                        >
                            <div className="h-16 w-16 rounded-full bg-gray-600" />
                            <div className="h-4 w-12 bg-gray-500 rounded" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-4 sm:gap-8 max-w-4xl mx-auto">
                    {/* Skeleton for Featured Contest */}
                    <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-gray-900 p-4 sm:p-8">
                        <Skeleton className="h-5 w-1/4 bg-gray-600 mb-2" />
                        <Skeleton className="h-8 w-3/4 bg-gray-500 mb-2" />
                        <Skeleton className="h-4 w-1/2 bg-gray-600 mb-4" />
                        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
                    </div>

                    {/* Skeleton for Upcoming Contest */}
                    <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden bg-gray-900 p-4 sm:p-8">
                        <Skeleton className="h-5 w-1/4 bg-gray-600 mb-2" />
                        <Skeleton className="h-8 w-3/4 bg-gray-500 mb-2" />
                        <Skeleton className="h-4 w-1/2 bg-gray-600 mb-4" />
                        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="p-4 sm:p-8 min-h-screen" >
            <h1 className="text-black dark:text-white font-semibold mb-4 text-center" style={{ letterSpacing: '1.5px', fontSize: '65px' }}
            >Contests</h1>
            <div className="flex gap-4 mb-6 overflow-x-auto whitespace-nowrap scrollbar w-full sm:justify-center">
                {[
                    { sport: 'NBA', logo: '/nba-logo.png' },
                    { sport: 'MLB', logo: '/mlb-logo.png' },
                    { sport: 'NFL', logo: '/nfl-logo.png' },
                    { sport: 'NHL', logo: '/nhl-logo.png' },
                    { sport: 'Soccer', logo: '/soccer-logo.png' },
                ].map(({ sport, logo }) => (
                    <button
                        key={sport}
                        onClick={() => {
                            setSelectedSport(sport as 'NBA' | 'MLB' | 'NFL' | 'NHL' | 'Soccer');
                            if (sport !== 'Soccer') {
                                setSelectedSoccerLeague(null);
                            }
                        }}
                        className={`flex flex-col items-center gap-2 px-4 py-4 rounded-lg w-24 text-center
                        hover:bg-gray-500/20 transition duration-200
                        ${selectedSport === sport ? 'border accent-border text-white' : 'text-gray-300'}`}
                    >
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-500/40">
                            <img
                                src={logo}
                                alt={`${sport} logo`}
                                className="h-full w-full object-contain p-1"
                            />
                        </div>
                        <span className="text-black dark:text-white text-s font-bold">{sport}</span>
                    </button>
                ))}
            </div>

            {/* Show Dropdown for Soccer Leagues */}
            {selectedSport === 'Soccer' && (
                <div className="mb-6 max-w-4xl mx-auto w-full p-1">
                    <label htmlFor="soccer-league" className="block text-black dark:text-white font-bold text-lg mb-2">Select a Soccer League:</label>
                    <select
                        id="soccer-league"
                        value={selectedSoccerLeague || ''}
                        onChange={(e) => setSelectedSoccerLeague(e.target.value)}
                        className="p-2 bg-gray-700 text-white rounded-lg w-full"
                    >
                        <option value="">-- Select a League --</option>
                        <option value="MLS">MLS</option>
                        <option value="EPL">English Premier League</option>
                        <option value="LALIGA">La Liga</option>
                        <option value="BUNDESLIGA">Bundesliga</option>
                        <option value="SERIE_A">Serie A</option>
                        <option value="LIGUE_1">Ligue 1</option>
                    </select>
                </div>
            )}

            {(selectedSport !== 'Soccer' || selectedSoccerLeague) && (
                <div className="flex flex-col gap-4 sm:gap-8 max-w-4xl mx-auto">
                    <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden" style={{ background: 'linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0))' }}>
                        <div className="p-4 sm:p-8">
                            <div className="uppercase tracking-wide text-sm text-white font-semibold">
                                Featured Contest
                            </div>
                            <h1 className="block mt-1 text-lg leading-tight font-medium text-white">
                                Today's {selectedSoccerLeague} {selectedSport} Games ({renderTodayGames().length} games)
                            </h1>
                            <p className="mt-2 text-slate-500">
                                Make your picks for today's {selectedSport} matchups!
                            </p>
                            <button
                                onClick={handleTodayPlayNow}
                                className="mt-4 w-full accent-button text-white py-2 px-4 rounded-lg transition duration-200"
                            >
                                Play Now
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden" style={{ background: 'linear-gradient(to right, rgb(17, 24, 39), rgb(0, 0, 0))' }}>
                        <div className="p-4 sm:p-8">
                            <div className="uppercase tracking-wide text-sm text-white font-semibold">
                                Upcoming Contest
                            </div>
                            <h1 className="block mt-1 text-lg leading-tight font-medium text-white">
                                Tomorrow's {selectedSoccerLeague} {selectedSport} Games ({renderTomorrowGames().length} games)
                            </h1>
                            <p className="mt-2 text-slate-500">
                                Get ready for tomorrow's {selectedSport} matchups!
                            </p>
                            <button
                                onClick={handleTomorrowPlayNow}
                                className="mt-4 w-full accent-button text-white py-2 px-4 rounded-lg transition duration-200"
                            >
                                Preview Games
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}