// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { db } from '@vercel/postgres';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let client;
  try {
    const { userId: adminId } = getAuth(req);
    console.log("Admin Clerk ID:", adminId);
    
    if (!adminId) {
      console.log('Not authenticated');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    client = await db.connect();
    const body = await req.json();
    const { picks, userId: targetUserId } = body;
    
    // If not admin, can only submit picks for themselves
    const effectiveUserId = (targetUserId || adminId);
    
    console.log('Received picks:', picks);
    console.log('Target User ID:', effectiveUserId);

    if (!picks || !Array.isArray(picks)) {
      console.log('Invalid request data');
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    // Get or create user in database
    const userResult = await client.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [effectiveUserId]
    );
    console.log("Database user lookup result:", userResult.rows);

    let dbUser;
    if (userResult.rows.length === 0) {
      // Create new user if they don't exist
      console.log('Creating new user in database');
      
      const createUserResult = await client.query(
        `INSERT INTO users (username, email, password, role, clerk_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          `user_${Date.now()}_${effectiveUserId.slice(0, 8)}`,
          `temp_${Date.now()}_${effectiveUserId.slice(0, 8)}@example.com`,
          '',
          1, // Regular user role
          effectiveUserId
        ]
      );
      dbUser = createUserResult.rows[0];
      console.log('Created new user:', dbUser);
    } else {
      dbUser = userResult.rows[0];
    }

    // First ensure all games exist with proper team names
    for (const pick of picks) {
      const existingGame = await prisma.game.findUnique({
        where: { id: pick.gameId }
      });

      if (!existingGame) {
        console.log(`Creating game record for ID: ${pick.gameId}`);
        await prisma.game.create({
          data: {
            id: pick.gameId,
            team1Name: pick.homeTeam,
            team2Name: pick.awayTeam,
            team1Logo: pick.homeTeamLogo || "",
            team2Logo: pick.awayTeamLogo || "",
          }
        });
      }
    }

    const pickRecords = picks.map((pick: { gameId: string; teamIndex: number }) => ({
      userId: effectiveUserId,
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
