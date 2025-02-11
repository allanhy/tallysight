/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

//yo does this work?
import React, { useState, useEffect, useRef } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import GameCard from '../components/GameCard';
import { Game } from '../types/game';
import Leaderboard from '../components/leaderboard';
import Link from 'next/link';

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1600 },
    items: 4,
    slidesToSlide: 1
  },
  desktop: {
    breakpoint: { max: 1600, min: 1024 },
    items: 3,
    slidesToSlide: 1
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};

// Add custom arrow components
const CustomRightArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-0 md:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/55 p-2 rounded-full shadow-md z-10"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

const CustomLeftArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute left-0 md:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/55 p-2 rounded-full shadow-md z-10"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        const data = await response.json();
        if (data.games) {
          const duplicatedGames = [...data.games, ...data.games, ...data.games];
          setGames(duplicatedGames);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Carousel Section */}
        <div className="relative mb-20">
          <div className="px-2 md:px-8">
            <Carousel
              ref={carouselRef}
              responsive={responsive}
              infinite={true}
              centerMode={false}
              partialVisible={false}
              swipeable={true}
              draggable={true}
              showDots={false}
              autoPlay={false}
              keyBoardControl={true}
              customTransition="transform 300ms ease-in-out"
              containerClass="carousel-container"
              itemClass="px-2"
              dotListClass="custom-dot-list-style"
              minimumTouchDrag={80}
              ssr={true}
              customRightArrow={<CustomRightArrow />}
              customLeftArrow={<CustomLeftArrow />}
              removeArrowOnDeviceType={[]}
            >
              {games.map((game, index) => (
                <div key={`${game.id}-${index}`} className="h-full">
                  <GameCard game={game} />
                </div>
              ))}
            </Carousel>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex flex-col items-center justify-center">
          <main className="flex flex-col gap-8 items-center w-full max-w-[750px]">
            <div className="flex flex-col gap-4 relative w-full">
              {/* White box with MyPicks button */}
              <div className="bg-white h-[200px] w-full relative bg-opacity-100 translate-y-[100px]">
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <Link href="/myPicks">
                    <button 
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      MyPicks
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Gray boxes */}
              <div className="bg-gray-200 h-[200px] w-full bg-opacity-75 translate-y-[150px]" />
              <div className="bg-gray-400 h-[200px] w-full bg-opacity-50 translate-y-[200px]" />
              <div className="bg-gray-600 h-[200px] w-full bg-opacity-25 translate-y-[250px]" />
              
              {/* Leaderboard */}
              <div className="justify-center">
                <Leaderboard />
              </div>
            </div>
          </main>
        </div>

        {/* Bottom Spacer */}
        <div className="bg-black w-full h-32" />
      </div>
    </div>
  );

}