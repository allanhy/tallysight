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

export async function GET() {
  try {
    const games = await sql`
      SELECT g.*, 
             p."teamIndex",
             p."userId"
      FROM "Game" g
      LEFT JOIN "Pick" p ON g.id = p."gameId"
      ORDER BY g."gameDate" DESC
    `;

    return NextResponse.json({ 
      success: true, 
      games: games.rows 
    });

  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to fetch games',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
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
        ON CONFLICT (id) DO UPDATE SET
          "team1Name" = EXCLUDED."team1Name",
          "team2Name" = EXCLUDED."team2Name",
          "team1Logo" = EXCLUDED."team1Logo",
          "team2Logo" = EXCLUDED."team2Logo",
          "gameDate" = EXCLUDED."gameDate",
          "status" = EXCLUDED."status"
      `;
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
