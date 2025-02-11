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

        // Add debug logs
        console.log('Fetching picks for user:', userId);

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

        return NextResponse.json({
            picks: filteredPicks || [],
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