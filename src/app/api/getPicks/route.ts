import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

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

        return NextResponse.json({ picks });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
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