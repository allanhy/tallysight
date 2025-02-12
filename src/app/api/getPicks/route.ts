import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        
        if (!userId) {
            return NextResponse.json({ 
                picks: [],
                error: 'Unauthorized' 
            });
        }

        const picks = await prisma.pick.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                gameId: true,
                teamIndex: true,
                createdAt: true,
                game: {
                    select: {
                        id: true,
                        team1Name: true,
                        team2Name: true,
                        team1Logo: true,
                        team2Logo: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            picks: picks || [],
            success: true
        });

    } catch (error) {
        console.error('GetPicks API Error:', error);
        return NextResponse.json({
            picks: [],
            error: 'Failed to fetch picks',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        await prisma.$disconnect();
    }
} 