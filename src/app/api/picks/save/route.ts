import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { picks } = body;

        if (!picks || !Array.isArray(picks)) {
            return NextResponse.json({ error: 'Invalid picks data' }, { status: 400 });
        }

        // Save picks directly to database instead of Clerk metadata
        const savedPicks = await prisma.pick.createMany({
            data: picks.map(pick => ({
                userId,
                gameId: pick.gameId,
                teamIndex: pick.teamIndex
            }))
        });

        return NextResponse.json({ 
            message: 'Picks saved successfully',
            picks: savedPicks
        });

    } catch (error) {
        console.error('Error saving picks:', error);
        return NextResponse.json({ 
            error: 'Failed to save picks',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
} 