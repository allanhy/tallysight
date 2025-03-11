"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";

interface Team {
  name: string;
  logo?: string;
  spread?: string;
  win?: string;
}

interface OddsPreviewProps {
  gameId: string;
  homeTeam: Team;
  awayTeam: Team;
  gameTime: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OddsPreview({
  gameId,
  homeTeam,
  awayTeam,
  gameTime,
  isOpen,
  onClose
}: OddsPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [odds, setOdds] = useState<{
    homeSpread?: string;
    homePrice?: string;
    homeMoneyline?: string;
    awaySpread?: string;
    awayPrice?: string;
    awayMoneyline?: string;
    bookmaker?: string;
  }>({});

  useEffect(() => {
    const fetchOdds = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // Pass team names to help with matching
        const response = await fetch(`/api/odds?gameId=${gameId}&homeTeam=${encodeURIComponent(homeTeam.name)}&awayTeam=${encodeURIComponent(awayTeam.name)}`);
        const data = await response.json();
        
        if (data.games && data.games.length > 0) {
          const game = data.games[0];
          setOdds({
            homeSpread: game.team1.spread,
            homePrice: game.team1.price,
            homeMoneyline: game.team1.moneyline,
            awaySpread: game.team2.spread,
            awayPrice: game.team2.price,
            awayMoneyline: game.team2.moneyline,
            bookmaker: game.bookmaker
          });
        }
      } catch (error) {
        console.error('Error fetching odds:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchOdds();
    }
  }, [gameId, isOpen, homeTeam.name, awayTeam.name]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-center dark:text-white">Game Preview</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
            {gameTime}
          </div>
          
          <div className="space-y-6">
            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  {awayTeam.logo ? (
                    <Image
                      src={awayTeam.logo}
                      alt={`${awayTeam.name} logo`}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                  )}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{awayTeam.name}</span>
              </div>
              
              <div className="flex flex-col items-end">
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Spread: {odds.awaySpread || 'N/A'}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ML: {odds.awayMoneyline || 'N/A'}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-center text-sm font-medium text-gray-900 dark:text-white">VS</div>
            
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  {homeTeam.logo ? (
                    <Image
                      src={homeTeam.logo}
                      alt={`${homeTeam.name} logo`}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                  )}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{homeTeam.name}</span>
              </div>
              
              <div className="flex flex-col items-end">
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      Spread: {odds.homeSpread || 'N/A'}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ML: {odds.homeMoneyline || 'N/A'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 