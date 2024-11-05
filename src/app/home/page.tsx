'use client';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import Leaderboard from "../components/leaderboard";

interface TeamInfo {
    name: string;
    points: number;
}

interface Game {
    teams: {
        home: TeamInfo;
        away: TeamInfo;
    };
    gameId: string; 
}

interface Week {
    games: Game[];
}

interface ApiResponse {
    weeks: Week[];
}

const settings = {
    dots: false,
    speed: 500,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '100px',
};

export default function Home() {
    const [gameData, setGameData] = useState<{ homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; gameId: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    
    const fetchData = async () => {
        try {
            const response = await fetch('/api/fetchGames'); //internal api route

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            console.log(data);

            const games = data.weeks.flatMap(week =>
                week.games.map(game => ({
                    homeTeam: game.teams.home.name,
                    awayTeam: game.teams.away.name,
                    homeScore: game.teams.home.points || 0,
                    awayScore: game.teams.away.points || 0,
                    gameId: game.gameId 
                }))
            );
            setGameData(games);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">
            {isLoading ? (
                <div>Loading game data...</div>
            ) : (
                <GameCarousel gameData={gameData} />
            )}
            <MainContent />
        </div>
    );
}


function GameCarousel({ gameData }: Readonly<{ gameData: { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; gameId: string }[] }>) {
    return (
        <div style={{ width: '800px', height: '100px', backgroundColor: 'white', color: 'black', borderRadius: '20px', padding: '0px' }}>
            <Slider {...settings}>
                {gameData.map(game => (
                    <div key={game.gameId} className="game-card">
                        <h3>{game.awayTeam} @ {game.homeTeam}</h3>
                        <p>{game.awayScore} - {game.homeScore}</p>
                    </div>
                ))}
            </Slider>
        </div>
    );
}


function MainContent() {
    return (
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <div className="flex flex-col gap-4 relative">
                <InfoButton />
                <OverlayDivs />
                <LeaderboardContainer />
            </div>
        </main>
    );
}


function InfoButton() {
    return (
        <div className="bg-white h-32 w-full relative" style={{ height: '200px', width: '750px', opacity: 1, transform: 'translateY(100px)' }}>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-1/2 right-4 transform -translate-y-1/2"
                onClick={() => alert('Hello World')}
            >
                MyPicks
            </button>
        </div>
    );
}

function OverlayDivs() {
    return (
        <>
            <div className="bg-gray-200 h-32 w-full" style={{ height: '200px', width: '750px', opacity: 0.75, transform: 'translateY(150px)' }} />
            <div className="bg-gray-400 h-32 w-96" style={{ height: '200px', width: '750px', opacity: 0.5, transform: 'translateY(200px)' }} />
            <div className="bg-gray-600 h-32 w-96" style={{ height: '200px', width: '750px', opacity: 0.25, transform: 'translateY(250px)' }} />
        </>
    );
}

function LeaderboardContainer() {
    return (
        <div className="relative transform translate-y-56">
            <Leaderboard />
        </div>
    );
}
