"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { X } from 'lucide-react';

interface Team {
  name: string;
  logo?: string;
  spread?: string;
  record?: string;
}

interface OddsPreviewProps {
  gameId: string;
  homeTeam: Team;
  awayTeam: Team;
  gameTime: string;
  isOpen: boolean;
  day: 'today' | 'tomorrow';
  onClose: () => void;
  sport: string;
}

export default function OddsPreview({
  gameId,
  homeTeam,
  awayTeam,
  gameTime,
  day,
  isOpen,
  onClose,
  sport
}: OddsPreviewProps) {
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchOdds = async () => {
        try {
          setLoading(true);
          console.log("Fetching odds for:", {
            gameId,
            homeTeam: homeTeam.name,
            awayTeam: awayTeam.name,
            homeTeamOdds: homeTeam.spread,
            awayTeamOdds: awayTeam.spread
          });

          // Calculate the correct date based on the 'day' prop
          const getDateParam = () => {
            let dayOfGame = "";

            if (day === 'tomorrow') {
              return dayOfGame = "tomorrow"
            }
            return dayOfGame = "today";
          };

          const response = await fetch(`/api/all-espn-games?sport=${sport}&day=${getDateParam()}`);

          if (!response.ok) {
            throw new Error('Failed to fetch odds data');
          }

          const data = await response.json();
          console.log('API Response data:', data);

          const filteredGame = data.games.find(
            (game: any) =>
              game.id === gameId &&
              game.homeTeam.name === homeTeam.name &&
              game.awayTeam.name === awayTeam.name
          );

          if (filteredGame) {
            setGameData(filteredGame);
          } else {
            throw new Error('No game data found');
          }
        } catch (err) {
          console.error('Error fetching odds:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchOdds();
    }
  }, [gameId, homeTeam.name, awayTeam.name, day, isOpen, sport]);

  // Determine favorite and underdog
  const getFavoriteAndUnderdog = () => {
    if (!gameData) return { favorite: null, underdog: null };

    const homeSpreadValue = isNaN(parseFloat(gameData.homeTeam.spread)) ? 0 : parseFloat(gameData.homeTeam.spread);
    const awaySpreadValue = isNaN(parseFloat(gameData.awayTeam.spread)) ? 0 : parseFloat(gameData.awayTeam.spread);

    if (homeSpreadValue < awaySpreadValue) {
      return {
        favorite: gameData.homeTeam.name,
        underdog: gameData.awayTeam.name,
        favoriteSpread: gameData.homeTeam.spread,
        underdogSpread: gameData.awayTeam.spread
      };
    } else {
      return {
        favorite: gameData.awayTeam.name,
        underdog: gameData.homeTeam.name,
        favoriteSpread: gameData.awayTeam.spread,
        underdogSpread: gameData.homeTeam.spread
      };
    }
  };

  const { favorite, underdog, favoriteSpread, underdogSpread } = gameData ? getFavoriteAndUnderdog() : { favorite: null, underdog: null, favoriteSpread: null, underdogSpread: null };

  return (
    <div className="p-4">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full bg-gray-300" />
          <Skeleton className="h-16 w-full bg-gray-300" />
          <Skeleton className="h-8 w-3/4 mx-auto bg-gray-300" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : gameData ? (
        <div>
          <div className="flex flex-col items-center mb-6">
            {/* Only show game time if it's valid */}
            {gameData.gameTime && gameData.gameTime !== "Invalid Date ET" && (
              <div className="text-sm text-gray-500 mb-2">{gameData.gameTime}</div>
            )}

            <div className="grid grid-cols-3 w-full items-center gap-2 mb-4">
              {/* Away Team */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src={gameData.awayTeam.logo || '/placeholder.png'}
                    alt={gameData.awayTeam.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-black">{gameData.awayTeam.name}</div>
                  {gameData.awayTeam.record && (
                    <div className="text-xs text-gray-500">{gameData.awayTeam.record}</div>
                  )}
                </div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-gray-400">VS</div>
                <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
                  <span className="text-xs font-medium text-blue-800">
                  {(() => {
                    switch (gameData.status?.toLowerCase()) {
                      case 'status_final':
                        return 'Final';
                      case 'status_in_progress':
                        return 'In Progress';
                      case 'status_halftime':
                        return 'Halftime';
                      default:
                        return 'Scheduled';
                    }
                  })()}
                  </span>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-2">
                  <Image
                    src={gameData.homeTeam.logo || '/placeholder.png'}
                    alt={gameData.homeTeam.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-black">{gameData.homeTeam.name}</div>
                  {gameData.homeTeam.record && (
                    <div className="text-xs text-gray-500">{gameData.homeTeam.record}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Spread Information */}
              <div className="w-full bg-gray-100 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-500">Spread</div>
                    <div className="font-bold text-blue-600">{gameData.awayTeam.spread}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Prediction</div>
                    <div className="font-bold text-gray-800">
                      {parseFloat(gameData.awayTeam.spread) < parseFloat(gameData.homeTeam.spread)
                        ? gameData.awayTeam.name
                        : gameData.homeTeam.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Spread</div>
                    <div className="font-bold text-blue-600">{gameData.homeTeam.spread}</div>
                  </div>
                </div>
                <p className="text-center text-xs italic text-gray-500 mt-1">
                Provided by ESPN
                </p>
              </div>

            {/* Favorite and Underdog Information */}
            {favorite && underdog && (
              <div className="w-full bg-blue-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-500">Favorite</div>
                    <div className="font-bold text-blue-600">{favorite}</div>
                    <div className="text-xs text-gray-500">{favoriteSpread}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Underdog</div>
                    <div className="font-bold text-green-600">{underdog}</div>
                    <div className="text-xs text-gray-500">{underdogSpread}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Venue and Broadcast Information */}
            <div className="w-full text-sm text-gray-600 space-y-2">
              {gameData.venue && (
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{gameData.venue}</span>
                </div>
              )}

              {gameData.broadcast && (
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{gameData.broadcast}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No game data available</div>
      )}
    </div>
  );
} 