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

    // Retrieve all picks for the authenticated user
    const userPicks = await prisma.pick.findMany({
      where: { userId },
      select: {
        gameId: true,
        teamIndex: true, // Select any other fields you need
      },
    });

    return NextResponse.json(userPicks, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user picks:', error.message || error);
    return NextResponse.json({ message: 'Failed to fetch user picks', error: error.message || 'Unknown error' }, { status: 500 });
  }
}
