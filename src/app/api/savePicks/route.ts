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

    // Check if first game has started
    const currentTime = new Date();
    
    // Convert current time to EST/EDT
    const estCurrentTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "America/New_York" }));
    
    // Sort picks by game time
    const sortedPicks = [...picks].sort((a, b) => {
      const timeA = new Date(`${pickDate}T${a.gameTime}`);
      const timeB = new Date(`${pickDate}T${b.gameTime}`);
      return timeA.getTime() - timeB.getTime();
    });

    // Get first game time and convert to EST/EDT
    const firstGameDateTime = new Date(`${pickDate}T${sortedPicks[0].gameTime}`);
    
    console.log('Current time (EST):', estCurrentTime);
    console.log('First game time:', firstGameDateTime);

    if (estCurrentTime >= firstGameDateTime) {
      console.log('Picks rejected - games have started');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot save picks - Games have already started',
          currentTime: estCurrentTime,
          firstGameTime: firstGameDateTime
        }, 
        { status: 400 }
      );
    }

    // Check if any individual game has started
    for (const pick of picks) {
      const gameDateTime = new Date(`${pickDate}T${pick.gameTime}`);
      if (estCurrentTime >= gameDateTime) {
        console.log(`Game ${pick.gameId} has already started`);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Cannot save picks - Some games have already started',
            currentTime: estCurrentTime,
            gameTime: gameDateTime
          }, 
          { status: 400 }
        );
      }
    }

    function convertToEST(dateStr: string): string {
      const date = new Date(dateStr);
      const estDate = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
      return estDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    }
  

    // First ensure all games exist
    for (const pick of picks) {
      const gameExists = await sql`
        SELECT id FROM "Game" WHERE id = ${pick.gameId}
      `;

      if (gameExists.rowCount === 0) {
        // Create game with additional fields for tracking status
        await sql`
          INSERT INTO "Game" (
            id,
            "team1Name",
            "team2Name",
            "team1Logo",
            "team2Logo",
            "gameDate",
            "status",
            "winner",
            "won",
            "final_score"
          ) VALUES (
            ${pick.gameId},
            ${pick.homeTeam.name},
            ${pick.awayTeam.name},
            ${pick.homeTeam.logo || ''},
            ${pick.awayTeam.logo || ''},
            ${convertToEST(pickDate)},
            ${pick.status || 'STATUS_SCHEDULED'},
            ${null},  // winner
            ${false},  // won
            ${null}  // final_score
          )
        `;
      }
    }

    // Create picks
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
        ON CONFLICT (id) DO NOTHING
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
