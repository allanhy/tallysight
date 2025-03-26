'use client';

import React, { useState, useEffect, useRef } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import GameCard from '../components/GameCard';
import { Game } from '../types/game';
import { Skeleton } from './ui/skeleton';

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

const carouselWithGames = ({ selectedSport }: { selectedSport: string }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`/api/all-espn-games?sport=${selectedSport}`);
        const data = await response.json();
        console.log(`Fetched data for ${selectedSport}:`, data); // Debugging

        if (data.games) {
          const duplicatedGames = [...data.games, ...data.games, ...data.games];
          setGames(duplicatedGames);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [selectedSport]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-12">
      {/* Carousel Section */}
      <div className="relative mb-5">
        <div className="px-2 md:px-8">
          {loading ? (
            // Skeleton Loader (Show while fetching)
            <div className="flex space-x-4">
              <Skeleton className="h-48 w-full rounded-lg bg-gray-300" />
            </div>   
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default carouselWithGames;