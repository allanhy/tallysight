// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { db } from '@vercel/postgres';

const prisma = new PrismaClient();

interface Pick {
  gameId: string;
  teamIndex: number;
  team1Name: string;
  team2Name: string;
  team1Logo: string;
  team2Logo: string;
  gameDate: Date;
}

export async function POST(req: NextRequest) {
  let client;
  try {
    const { userId } = getAuth(req);
    console.log("Clerk User ID:", userId);
    
    if (!userId) {
      console.log('User not authenticated');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Get user from database using Clerk ID
    client = await db.connect();
    const userResult = await client.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [userId]
    );
    console.log("Database user lookup result:", userResult.rows);

    if (userResult.rows.length === 0) {
      // Create new user if they don't exist
      console.log('Creating new user in database');
      const clerkId = userId;  // Use the userId from getAuth() above
      
      const createUserResult = await client.query(
        `INSERT INTO users (
          username, 
          email, 
          password,
          role,
          clerk_id
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          `user_${Date.now()}_${userId.slice(0, 8)}`,
          `temp_${Date.now()}_${userId.slice(0, 8)}@example.com`,
          '',
          1,
          userId
        ]
      );
      console.log("New user created:", createUserResult.rows[0]);
    }

    const body = await req.json();
    const { picks } = body;
    console.log('Received picks:', picks);

    if (!picks || !Array.isArray(picks)) {
      console.log('Invalid request data');
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    // First ensure all games exist with proper team names, logos, and dates
    for (const pick of picks) {
      const existingGame = await prisma.game.findUnique({
        where: { id: pick.gameId }
      });

      if (!existingGame) {
        // Get current date in ET timezone
        const now = new Date();
        const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        
        const gameData: Prisma.GameCreateInput = {
          id: pick.gameId,
          team1Name: pick.team1Name || "Team 1",
          team2Name: pick.team2Name || "Team 2",
          team1Logo: pick.team1Logo || "",
          team2Logo: pick.team2Logo || "",
        
        };

        console.log('Creating game with data:', gameData);

        await prisma.game.create({
          data: gameData
        });
      }
    }

    // Create picks with proper team information
    const pickRecords = await Promise.all(picks.map(async pick => {
      const gameDate = await prisma.game.findUnique({
        where: { id: pick.gameId },
      });

      return {
        userId: userId,
        gameId: pick.gameId,
        teamIndex: pick.teamIndex,
      };
    }));

    await prisma.pick.createMany({
      data: pickRecords
    });

    return NextResponse.json({ message: 'Picks saved successfully' });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error saving picks:', error.message);
    } else {
      console.error('Unexpected error saving picks:', error);
    }
    return NextResponse.json({ message: 'Failed to save picks' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
