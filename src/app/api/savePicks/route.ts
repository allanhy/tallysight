/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

interface Pick {
  gameId: string;
  teamIndex: number;
  homeTeam: {
    name: string;
    logo: string;
    isUnderdog?: boolean;
  };
  awayTeam: {
    name: string;
    logo: string;
    isUnderdog?: boolean;
  };
  gameTime: string;
  status: string;
  pickDate?: string;
  estDate?: string;
  fullDate?: string;
  dbDate?: string;
  dbTime?: string;
  bestPick?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { picks, pickDate } = body;

    if (!picks || !Array.isArray(picks) || !pickDate) {
      return NextResponse.json({ message: 'Invalid picks format or missing date' }, { status: 400 });
    }
    
    function convertToEST(dateStr: string): string {
      const date = new Date(dateStr);
      const estDate = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
      return estDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    }
    
    function extractTimeFromISO(isoString: string): string {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { 
        timeZone: 'America/New_York',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    // Store the original UTC date string from ESPN
    function getGameDateUTC(dateStr: string): string {
      try {
        // Parse the date string properly
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
         //console.error(`Invalid date string: ${dateStr}`);
          return new Date().toISOString().split('T')[0]; // Default to today
        }
        
        // Format as YYYY-MM-DD in UTC
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day}`;
       //console.log(`Parsed UTC date from ${dateStr} to ${formattedDate}`);
        return formattedDate;
      } catch (error) {
       //console.error(`Error parsing date: ${dateStr}`, error);
        return new Date().toISOString().split('T')[0]; // Default to today
      }
    }

    // Store the original UTC time from ESPN
    function getGameTimeUTC(dateStr: string): string {
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return '19:00:00'; // Default
        }
        
        // Format as HH:MM:SS in UTC
        return date.toISOString().split('T')[1].split('.')[0];
      } catch (error) {
       //console.error(`Error extracting UTC time:`, error);
        return '19:00:00';
      }
    }

    // First ensure all games exist
    for (const pick of picks) {
      const sport = pick.sport || (
        pick.homeTeam.logo.includes('/mlb/') ? 'MLB' 
                : pick.homeTeam.logo.includes('/nba/') ? 'NBA' 
                : pick.homeTeam.logo.includes('/nfl/') ? 'NFL' 
                : pick.homeTeam.logo.includes('/nhl/') ? 'NHL' 
                : pick.homeTeam.logo.includes('/mls/') ? 'MLS' 
                : pick.homeTeam.logo.includes('/epl/') ? 'EPL' 
                : pick.homeTeam.logo.includes('/laliga/') ? 'LALIGA' 
                : pick.homeTeam.logo.includes('/bundesliga/') ? 'BUNDESLIGA' 
                : pick.homeTeam.logo.includes('/serie_a/') ? 'SERIE_A' 
                : pick.homeTeam.logo.includes('/ligue_1/') ? 'LIGUE_1'
                : null
      );

    if (!sport) {
        console.error(`Could not determine sport for gameId ${pick.gameId}`);
        return NextResponse.json({ 
            success: false,
            message: `Failed to determine sport for gameId ${pick.gameId}`
        }, { status: 400 });
    }
      // Check if game exists
      const gameExists = await sql`
        SELECT id FROM "Game" WHERE id = ${pick.gameId}
      `;

      if (gameExists.rowCount === 0) {
        let gameDate, gameTime;
        
        // Use the dbDate and dbTime fields if they exist (these are already in EST)
        if (pick.dbDate && pick.dbTime) {
          gameDate = pick.dbDate;
          gameTime = pick.dbTime;
         //console.log(`Using pre-formatted database date: ${gameDate} and time: ${gameTime}`);
        }
        // Otherwise use the fullDate field and convert it
        else if (pick.fullDate) {
          const utcDate = new Date(pick.fullDate);
          
          // Convert to EST for the date
          const estDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
          
          // Format date as YYYY-MM-DD
          const year = estDate.getFullYear();
          const month = String(estDate.getMonth() + 1).padStart(2, '0');
          const day = String(estDate.getDate()).padStart(2, '0');
          gameDate = `${year}-${month}-${day}`;
          
          // Format time as HH:MM:SS
          const hours = String(estDate.getHours()).padStart(2, '0');
          const minutes = String(estDate.getMinutes()).padStart(2, '0');
          const seconds = String(estDate.getSeconds()).padStart(2, '0');
          gameTime = `${hours}:${minutes}:${seconds}`;
          
         //console.log(`Converted fullDate ${pick.fullDate} to EST date: ${gameDate} and time: ${gameTime}`);
        }
        // Fallback to defaults
        else {
          gameDate = new Date().toISOString().split('T')[0];
          gameTime = '19:00:00';
         //console.log(`No date information found, using defaults: ${gameDate} and time: ${gameTime}`);
        }
        
        await sql`
          INSERT INTO "Game" (
            id,
            "team1Name",
            "team2Name",
            "team1Logo",
            "team2Logo",
            "gameDate",
            "gameTime",
            "sport"
          ) VALUES (
            ${pick.gameId},
            ${pick.homeTeam.name},
            ${pick.awayTeam.name},
            ${pick.homeTeam.logo || ''},
            ${pick.awayTeam.logo || ''},
            ${gameDate}::date,
            ${gameTime}::time,
            ${sport}
          )
        `;
      }
    }

    // Create picks, conflict if user already made picks for that game
    for (const pick of picks) {
      const sport = pick.sport || (
        pick.homeTeam.logo.includes('/mlb/') ? 'MLB'
        : pick.homeTeam.logo.includes('/nba/') ? 'NBA'
        : pick.homeTeam.logo.includes('/nfl/') ? 'NFL'
        : pick.homeTeam.logo.includes('/nhl/') ? 'NHL'
        : pick.homeTeam.logo.includes('/mls/') ? 'MLS'
        : pick.homeTeam.logo.includes('/epl/') ? 'EPL'
        : pick.homeTeam.logo.includes('/laliga/') ? 'LALIGA'
        : pick.homeTeam.logo.includes('/bundesliga/') ? 'BUNDESLIGA'
        : pick.homeTeam.logo.includes('/serie_a/') ? 'SERIE_A'
        : pick.homeTeam.logo.includes('/ligue_1/') ? 'LIGUE_1'
        : null
    );

    if (!sport) {
        console.error(`Could not determine sport for gameId ${pick.gameId}`);
        return NextResponse.json({ 
            success: false,
            message: `Failed to determine sport for gameId ${pick.gameId}`
        }, { status: 400 });
    }
      await sql`
        INSERT INTO "Pick" (
          id,
          "userId",
          "gameId",
          "teamIndex",
          "createdAt",
          "sport",
          "isBestPick",
          "isUnderdog"
        ) VALUES (
          ${crypto.randomUUID()},
          ${userId},
          ${pick.gameId},
          ${pick.teamIndex},
          NOW() AT TIME ZONE 'America/New_York',
          ${sport},
          ${pick.bestPick || false},
          ${pick.teamIndex === 0 ? pick.homeTeam.isUnderdog : pick.awayTeam.isUnderdog}
        )
        ON CONFLICT ("userId", "gameId") DO UPDATE
        SET "teamIndex" = EXCLUDED."teamIndex",
            "createdAt" = EXCLUDED."createdAt",
            "isBestPick" = EXCLUDED."isBestPick",
            "isUnderdog" = EXCLUDED."isUnderdog";
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Picks saved successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving picks:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to save picks',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
