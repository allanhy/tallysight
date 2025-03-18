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
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  gameTime: string;
  status: string;
  pickDate?: string;
  estDate?: string;
  fullDate?: string;
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
  

    // First ensure all games exist
    for (const pick of picks) {
      // Check if game exists
      const gameExists = await sql`
        SELECT id FROM "Game" WHERE id = ${pick.gameId}
      `;

      if (gameExists.rowCount === 0) {
        // Use the estDate field if available, or convert from fullDate as fallback
        const gameDate = pick.estDate 
          ? pick.estDate.split('/').reverse().join('-') // Convert MM/DD/YYYY to YYYY-MM-DD
          : (pick.fullDate ? convertToEST(pick.fullDate) : convertToEST(pickDate));
        
        // Extract time from fullDate if available, otherwise use default time
        let gameTime = '19:00:00'; // Default to 7:00 PM
        if (pick.fullDate) {
          const date = new Date(pick.fullDate);
          gameTime = date.toLocaleTimeString('en-US', { 
            timeZone: 'America/New_York',
            hour12: false 
          });
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
            ${'NFL'} -- Default sport, adjust as needed
          )
        `;
      }
    }

    // Check if picks have already been made for today
    const today = convertToEST(pickDate);
    const existingPicks = await sql`
      SELECT * FROM "Pick"
      WHERE "userId" = ${userId} AND "createdAt"::date = ${today}
    `;

    if (existingPicks.rows.length > 0) {
      return NextResponse.json({ message: 'Picks have already been made for today.', }, { status: 409 }); // Conflict status code
    }

    // Create picks, conflict if user already made picks for that game
    for (const pick of picks) {
      await sql`
        INSERT INTO "Pick" (
          id,
          "userId",
          "gameId",
          "teamIndex",
          "createdAt"
        ) VALUES (
          ${crypto.randomUUID()},
          ${userId},
          ${pick.gameId},
          ${pick.teamIndex},
          NOW() AT TIME ZONE 'America/New_York'
        )
        ON CONFLICT ("userId", "gameId") DO NOTHING
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
