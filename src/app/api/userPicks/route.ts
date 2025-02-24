// /src/app/api/userPicks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userPicks = await prisma.pick.findMany({
      where: {
        userId: userId
      },
      include: {
        Game: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedPicks = userPicks.map(pick => ({
      gameId: pick.gameId,
      teamIndex: pick.teamIndex,
      homeTeam: pick.Game.team1Name,
      awayTeam: pick.Game.team2Name,
      homeTeamLogo: pick.Game.team1Logo || null,
      awayTeamLogo: pick.Game.team2Logo || null,
      createdAt: pick.createdAt
    }));

    return NextResponse.json(formattedPicks, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user picks:', error.message || error);
    return NextResponse.json(
      { message: 'Failed to fetch user picks', error: error.message || 'Unknown error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
