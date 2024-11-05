'use client';


{/* this is the home page also known as the contests page that wil let you enter into the picks
as well as go to the leaderboards and MyPicks page
*/}
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import Leaderboard from "../components/leaderboard"; // Assuming you have this component

//interfaces for the slider component 
interface Game {
  homeTeam: string;
  awayTeam: string;
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
        const response = await fetch('pages\API\games.js');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setGameData(data.games); // Access the games array from the response
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
    className: "carousel-white", // Add a custom class name
  };


  return ( // Added the return statement 
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">

<div style={{ width: '800px', margin: '0 auto', backgroundColor: 'white', color: 'black', height: '100px', justifyContent: 'center', alignContent: 'center'
 }}>

<Slider {...settings}>
        {gameData.map((game, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100px' // Make sure the slide has enough height
          }}>
            <h3>{game.awayTeam} @ {game.homeTeam}</h3>
          </div>
        ))}
      </Slider>
    </div>

      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-4 relative">

          <div className="bg-white h-32 w-full relative bg-opacity-100 translate-y-[100px]" style={{ height: '200px ', width: '750px' }}>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-1/2 right-4 transform -translate-y-1/2"
              onClick={() => alert('Hello, world!')} 
            >
              MyPicks
            </button>
          </div>
          <div className="bg-gray-200 h-32 w-full bg-opacity-75 translate-y-[150px]" style={{ height: '200px ', width: '750px' }} />
          <div className="bg-gray-400 h-32 w-96 bg-opacity-50 translate-y-[200px]" style={{ height: '200px ', width: '750px' }} />
          <div className="bg-gray-600 h-32 w-96 bg-opacity-25 translate-y-[250px]" style={{ height: '200px ', width: '750px' }} />

          <div className="relative transform translate-y-56">
            <Leaderboard /> 
          </div>
        </div>
      </main>
    </div>
  )
}