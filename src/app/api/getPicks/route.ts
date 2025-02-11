import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { userId } = auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Attempting to fetch picks for user:', userId);

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

        console.log('Successfully fetched picks:', picks.length);

        if (!picks) {
            return NextResponse.json({ picks: [] });
        }

        return NextResponse.json({ picks });

    } catch (error) {
        console.error('Detailed API Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch picks', 
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
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