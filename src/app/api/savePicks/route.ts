// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { db } from '@vercel/postgres';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let client;
  try {
    const { userId } = getAuth(req);
    console.log("Clerk User ID:", userId);
    
    if (!userId) {
      console.log('User not authenticated');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has already made picks today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingPicks = await prisma.pick.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingPicks) {
      console.log('User has already made picks today');
      return NextResponse.json(
        { message: 'You have already made picks for today' }, 
        { status: 400 }
      );
    }

    // Get user from database using Clerk ID
    client = await db.connect();
    const userResult = await client.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [userId]
    );
    console.log("Database user lookup result:", userResult.rows);

    let dbUser;
    if (userResult.rows.length === 0) {
      // Create new user if they don't exist
      console.log('Creating new user in database');
      const clerkId = userId;  // Use the userId from getAuth() above
      
      const createUserResult = await client.query(
        `INSERT INTO users (username, email, password, role, clerk_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          `user_${Date.now()}_${userId.slice(0, 8)}`,
          `temp_${Date.now()}_${userId.slice(0, 8)}@example.com`,
          '',
          1,
          userId
        ]
      );
      dbUser = createUserResult.rows[0];
      console.log('Created new user:', dbUser);
    } else {
      dbUser = userResult.rows[0];
    }

    const body = await req.json();
    const { picks } = body;
    console.log('Received picks:', picks);

    if (!picks || !Array.isArray(picks)) {
      console.log('Invalid request data');
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    // First ensure all games exist
    for (const pick of picks) {
      const existingGame = await prisma.game.findUnique({
        where: { id: pick.gameId }
      });

      if (!existingGame) {
        console.log(`Creating game record for ID: ${pick.gameId}`);
        await prisma.game.create({
          data: {
            id: pick.gameId,
            team1Name: "Team 1",
            team2Name: "Team 2",
            team1Logo: "",
            team2Logo: "",
          }
        });
      }
    }

    const pickRecords = picks.map((pick: { gameId: string; teamIndex: number }) => ({
      userId: userId,
      gameId: pick.gameId,
      teamIndex: pick.teamIndex,
    }));

    console.log('Attempting to save picks:', pickRecords);

    await prisma.pick.createMany({
      data: pickRecords,
    });

    console.log('Picks saved successfully');
    return NextResponse.json({ message: 'Picks saved successfully' });
  } catch (error: any) {
    console.error('Error saving picks:', error.message || error);
    return NextResponse.json(
      { message: 'Failed to save picks', error: error.message || 'Unknown error' }, 
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
