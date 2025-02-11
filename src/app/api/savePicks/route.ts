// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log("User ID:", userId);
    if (!userId) {
      console.log('User not authenticated');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { picks } = body;
    console.log('Received picks:', picks);

    if (!picks || !Array.isArray(picks)) {
      console.log('Invalid request data');
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    // First, create games if they don't exist
    await Promise.all(picks.map(async (pick: any) => {
      await prisma.game.upsert({
        where: { id: pick.gameId },
        update: {}, // No updates if exists
        create: {
          id: pick.gameId,
          team1Name: "Team 1",
          team2Name: "Team 2",
          team1Logo: null,
          team2Logo: null
        }
      });
    }));

    // Then create the picks
    const savedPicks = await prisma.pick.createMany({
      data: picks.map((pick: any) => ({
        userId,
        gameId: pick.gameId,
        teamIndex: pick.teamIndex
      }))
    });

    console.log('Picks saved successfully');
    return NextResponse.json({ message: 'Picks saved', picks: savedPicks });
  } catch (error: any) {
    console.error('Error saving picks:', error.message || error);
    return NextResponse.json({ message: 'Failed to save picks', error: error.message || 'Unknown error' }, { status: 500 });
  }
}
