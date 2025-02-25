// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
  const client = await pool.connect();
  
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { picks, pickDate } = body;

    // Validate picks and date
    if (!picks || !Array.isArray(picks) || !pickDate) {
      return NextResponse.json({ message: 'Invalid picks format or missing date' }, { status: 400 });
    }

    await client.query('BEGIN'); // Start transaction

    // First ensure all games exist
    for (const pick of picks) {
      // Check if game exists
      const gameExists = await client.query(
        'SELECT id FROM "Game" WHERE id = $1',
        [pick.gameId]
      );

      if (gameExists.rows.length === 0) {
        // Create game with proper team names
        await client.query(
          `INSERT INTO "Game" (id, "team1Name", "team2Name", "team1Logo", "team2Logo", "gameDate") 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            pick.gameId,
            pick.homeTeam.name,
            pick.awayTeam.name,
            pick.homeTeam.logo || '',
            pick.awayTeam.logo || '',
            new Date(pickDate)
          ]
        );
      }
    }

    // Create picks
    for (const pick of picks) {
      await client.query(
        `INSERT INTO "Pick" (id, "userId", "gameId", "teamIndex", "createdAt")
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT DO NOTHING`,
        [
          crypto.randomUUID(),
          userId,
          pick.gameId,
          pick.teamIndex
        ]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Picks saved successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Full error:', error);
    return NextResponse.json({ 
      message: 'Failed to save picks',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    client.release();
  }
}
