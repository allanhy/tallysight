// src/app/api/savePicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient, Prisma } from '@prisma/client';

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
  pickDate?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log("Clerk User ID:", userId);
    
    if (!userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { picks, pickDate } = body;
    console.log('Received picks:', JSON.stringify(picks, null, 2));
    console.log('Pick date:', pickDate);

    // Validate picks and date
    if (!picks || !Array.isArray(picks) || !pickDate) {
      return NextResponse.json({ message: 'Invalid picks format or missing date' }, { status: 400 });
    }

    // First ensure all games exist
    for (const pick of picks) {
      try {
        const existingGame = await prisma.game.findUnique({
          where: { id: pick.gameId }
        });

        if (!existingGame) {
          const gameData = {
            id: pick.gameId,
            team1Name: pick.homeTeam.name,
            team2Name: pick.awayTeam.name,
            team1Logo: pick.homeTeam.logo || '',
            team2Logo: pick.awayTeam.logo || '',
            gameDate: new Date() // temporary default value
          };

          console.log('Creating game:', JSON.stringify(gameData, null, 2));
          await prisma.game.create({ data: gameData });
        }
      } catch (error) {
        console.error('Error creating game:', error);
        throw error;
      }
    }

    // Create picks
    try {
      const pickRecords = picks.map(pick => ({
        userId,
        gameId: pick.gameId,
        teamIndex: pick.teamIndex
      }));

      console.log('Creating picks:', JSON.stringify(pickRecords, null, 2));
      await prisma.pick.createMany({
        data: pickRecords,
        skipDuplicates: true
      });

      return NextResponse.json({ message: 'Picks saved successfully' });
    } catch (error) {
      console.error('Error saving picks:', error);
      throw error;
    }

  } catch (error) {
    console.error('Full error:', error);
    return NextResponse.json({ 
      message: 'Failed to save picks',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
