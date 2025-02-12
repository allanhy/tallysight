import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Add debug logs
        console.log('Fetching picks for user:', userId);

        const picks = await prisma.pick.findMany({
            where: {
                userId: userId
            },
            include: {
                game: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('Found picks:', picks.length);

        if (!picks) {
            return NextResponse.json({ picks: [] });
        }

        // Group picks by game and date
        const uniquePicks = picks.reduce((acc, pick) => {
            const date = new Date(pick.createdAt).toDateString();
            const key = `${pick.gameId}-${date}`;
            
            if (!acc[key] || new Date(pick.createdAt) > new Date(acc[key].createdAt)) {
                acc[key] = pick;
            }
            
            return acc;
        }, {} as Record<string, typeof picks[0]>);

        const filteredPicks = Object.values(uniquePicks).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ picks: filteredPicks });

    } catch (error) {
        console.error('GetPicks API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch picks', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function GETAuth(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // TODO: Replace with your actual database query
        // This is just example data
        const picks = [
            {
                id: "1",
                gameId: "game1",
                teamIndex: 0,
                createdAt: new Date().toISOString(),
                game: {
                    team1: { name: "Team A", logo: "/team-a-logo.png" },
                    team2: { name: "Team B", logo: "/team-b-logo.png" }
                }
            }
        ];

        return NextResponse.json({ picks });
        
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
} 