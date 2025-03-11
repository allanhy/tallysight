"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import { X } from 'lucide-react';

interface Team {
  name: string;
  logo?: string;
  record?: string;
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
    awaySpread?: string;
    homeRecord?: string;
    awayRecord?: string;
    venue?: string;
    broadcast?: string;
    status?: string;
    date?: string;
  }>({});
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOdds = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Pass team names to help with matching
        const response = await fetch(`/api/odds?gameId=${gameId}&homeTeam=${encodeURIComponent(homeTeam.name)}&awayTeam=${encodeURIComponent(awayTeam.name)}`);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.games && data.games.length > 0) {
          const game = data.games[0];
          setOdds({
            homeSpread: game.team1.spread,
            awaySpread: game.team2.spread,
            homeRecord: game.team1.record,
            awayRecord: game.team2.record,
            venue: game.venue,
            broadcast: game.broadcast,
            status: game.status,
            date: game.date
          });
        } else {
          setError("No odds data available for this game");
        }
      } catch (error) {
        console.error('Error fetching odds:', error);
        setError("Failed to load odds data");
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
      <DialogContent className="sm:max-w-md bg-[#1a1a2e] text-white border-0 p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-bold text-white">Game Preview</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-white">
            <X size={20} />
          </DialogClose>
        </DialogHeader>
        
        <div className="p-6">
          {error ? (
            <div className="text-center text-red-400 py-8">
              {error}
              <div className="mt-2 text-sm text-gray-400">
                Check back later for updated odds
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                {/* Away Team */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2">
                    {awayTeam.logo ? (
                      <Image
                        src={awayTeam.logo}
                        alt={`${awayTeam.name} logo`}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded-full" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{awayTeam.name}</h3>
                </div>
                
                <div className="text-xl font-bold text-gray-400">vs</div>
                
                {/* Home Team */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2">
                    {homeTeam.logo ? (
                      <Image
                        src={homeTeam.logo}
                        alt={`${homeTeam.name} logo`}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded-full" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{homeTeam.name}</h3>
                </div>
              </div>
              
              {/* Odds Section */}
              <div className="flex justify-between items-center mb-8">
                {/* Away Team Spread */}
                <div className="text-center">
                  {loading ? (
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-500">{odds.awaySpread || 'N/A'}</div>
                  )}
                </div>
                
                <div className="text-gray-400 text-sm uppercase">Spread</div>
                
                {/* Home Team Spread */}
                <div className="text-center">
                  {loading ? (
                    <Skeleton className="h-8 w-16 bg-gray-700" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500">{odds.homeSpread || 'N/A'}</div>
                  )}
                </div>
              </div>
              
              {/* Records Section */}
              {(odds.homeRecord || odds.awayRecord) && (
                <div className="flex justify-between items-center mb-8">
                  {/* Away Team Record */}
                  <div className="text-center">
                    <div className="text-lg text-gray-300">{odds.awayRecord || 'N/A'}</div>
                  </div>
                  
                  <div className="text-gray-400 text-sm uppercase">W-L</div>
                  
                  {/* Home Team Record */}
                  <div className="text-center">
                    <div className="text-lg text-gray-300">{odds.homeRecord || 'N/A'}</div>
                  </div>
                </div>
              )}
              
              {/* Game Details */}
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="font-bold w-24 text-gray-400">Date:</span>
                  <span className="text-white">{odds.date || gameTime}</span>
                </div>
                {odds.venue && (
                  <div className="flex">
                    <span className="font-bold w-24 text-gray-400">Venue:</span>
                    <span className="text-white">{odds.venue}</span>
                  </div>
                )}
                {odds.broadcast && (
                  <div className="flex">
                    <span className="font-bold w-24 text-gray-400">Broadcast:</span>
                    <span className="text-white">{odds.broadcast}</span>
                  </div>
                )}
                {odds.status && (
                  <div className="flex">
                    <span className="font-bold w-24 text-gray-400">Status:</span>
                    <span className="text-white">{odds.status}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 