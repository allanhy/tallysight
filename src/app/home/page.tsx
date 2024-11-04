'use client';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import Leaderboard from "../components/leaderboard";

interface Game {
    awayScore: number;
    awayTeam: string;
    homeScore: number;
    homeTeam: string;
    scoring: number;
}

interface Week {
    games: Game[];
}

interface ApiResponse {
    weeks: Week[];
}

export default function Home() {
    const [gameData, setGameData] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Make the API request using fetch
                const response = await fetch(
                    'https://api.sportradar.com/nfl/official/trial/v7/en/games/current_week/schedule.json?api_key=raq8bQc77QJkTp4pjcHwA7hQOl7mePBDeuvHvj7x',
                    { headers: { accept: 'application/json' } }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data: ApiResponse = await response.json();
                console.log(data);

                const games = data.weeks.flatMap(week => week.games.map(game => ({
                    homeTeam: game.teams.home.name,
                    awayTeam: game.teams.away.name,
                    homeScore: game.scoring?.home_points || 0,
                    awayScore: game.scoring?.away_points || 0,
                })));
                setGameData(games);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const settings = {
        dots: false,
        speed: 500,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '100px',
    };

    return (

        <div
        className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">
        {isLoading ? <div>Loading game data...</div> : <div style={{
            width: '800px',
            height: '100px',
            backgroundColor: 'white',
            color: 'black',
            border: '0px solid black',
            borderRadius: '20px',
            padding: '0px'
        }}>
            <Slider {...settings}>
                {gameData.map((game, index) => (
                    <div key={index} className="game-card">
                        <h3>{game.awayTeam} @ {game.homeTeam}</h3>
                        <p>{game.awayScore} - {game.homeScore}</p>
                    </div>
                ))}
            </Slider>
        </div>}

        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <div className="flex flex-col gap-4 relative">
                <div className="bg-white h-32 w-full relative"
                     style={{height: '200px ', width: '750px', opacity: 1, transform: 'translateY(100px)'}}>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-1/2 right-4 transform -translate-y-1/2"
                        onClick={() => alert('Hello World')}>
                        MyPicks
                    </button>
                </div>
                <div className="bg-gray-200 h-32 w-full"
                     style={{height: '200px ', width: '750px', opacity: 0.75, transform: 'translateY(150px)'}}/>
                <div className="bg-gray-400 h-32 w-96"
                     style={{height: '200px ', width: '750px', opacity: 0.5, transform: 'translateY(200px)'}}/>
                <div className="bg-gray-600 h-32 w-96"
                     style={{height: '200px ', width: '750px', opacity: 0.25, transform: 'translateY(250px)'}}/>

                <div className="relative transform translate-y-56">
                    <Leaderboard/>
                </div>
            </div>
        </main>
    </div>

)
}