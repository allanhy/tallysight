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
        // Create game with exact column names from schema
        await sql`
          INSERT INTO "Game" (
            id,
            "team1Name",
            "team2Name",
            "team1Logo",
            "team2Logo",
            "gameDate"
          ) VALUES (
            ${pick.gameId},
            ${pick.homeTeam.name},
            ${pick.awayTeam.name},
            ${pick.homeTeam.logo || ''},
            ${pick.awayTeam.logo || ''},
            ${convertToEST(pickDate)}
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
