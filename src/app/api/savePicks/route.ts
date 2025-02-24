// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { db } from '@vercel/postgres';

const prisma = new PrismaClient();

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
    console.log('Received picks data structure:', JSON.stringify(picks, null, 2));

    if (!picks || !Array.isArray(picks)) {
      console.log('Invalid request data');
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    // First ensure all games exist with proper team names, logos, and dates
    for (const pick of picks) {
      try {
        const existingGame = await prisma.game.findUnique({
          where: { id: pick.gameId }
        });
        console.log('Existing game check:', pick.gameId, existingGame ? 'found' : 'not found');

        if (!existingGame) {
          // Convert gameTime to a Date object
          const [time, period] = pick.gameTime.split(' ');
          const [hours, minutes] = time.split(':');
          const now = new Date();
          const gameDate = new Date(now.setHours(
            period === 'PM' ? parseInt(hours) + 12 : parseInt(hours),
            parseInt(minutes),
            0,
            0
          ));

          const gameData: Prisma.GameCreateInput = {
            id: pick.gameId,
            team1Name: pick.homeTeam.name,
            team2Name: pick.awayTeam.name,
            team1Logo: pick.homeTeam.logo || "",
            team2Logo: pick.awayTeam.logo || "",
         
          };

          console.log('Attempting to create game with data:', JSON.stringify(gameData, null, 2));
          await prisma.game.create({
            data: gameData
          });
        }
      } catch (gameError) {
        console.error('Error processing game:', pick.gameId, gameError);
        throw gameError;
      }
    }

    // Create picks with proper team information
    try {
      const pickRecords = picks.map(pick => ({
        userId: userId,
        gameId: pick.gameId,
        teamIndex: pick.teamIndex,
      }));

      console.log('Attempting to create picks:', JSON.stringify(pickRecords, null, 2));
      await prisma.pick.createMany({
        data: pickRecords
      });
    } catch (picksError) {
      console.error('Error creating picks:', picksError);
      throw picksError;
    }

    return NextResponse.json({ message: 'Picks saved successfully' });

  } catch (error) {
    console.error('Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return NextResponse.json({ 
      message: 'Failed to save picks',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) client.release();
    await prisma.$disconnect();
  }
}
