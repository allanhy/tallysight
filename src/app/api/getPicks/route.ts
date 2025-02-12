import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        // Log auth status
        const auth = getAuth(request);
        console.log('Auth status:', auth);
        
        const { userId } = auth;
        console.log('UserId:', userId);

        if (!userId) {
            console.log('No userId found - returning unauthorized');
            return NextResponse.json({ 
                picks: [], 
                error: 'Unauthorized' 
            }, { 
                status: 401 
            });
        }

        // Log database connection attempt
        console.log('Attempting to connect to database...');
        
        // Test database connection
        await prisma.$connect();
        console.log('Database connected successfully');

        // Log query attempt
        console.log('Attempting to fetch picks for userId:', userId);

        const picks = await prisma.pick.findMany({
            where: {
                userId: userId
            },
            include: {
                game: true
            }
        });

        console.log('Successfully fetched picks:', picks);

        return NextResponse.json({ picks });

    } catch (error) {
        // Enhanced error logging
        console.error('GetPicks API Error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            type: error instanceof Error ? error.constructor.name : typeof error
        });
        
        return NextResponse.json({
            picks: [],
            error: error instanceof Error ? error.message : 'Failed to fetch picks'
        }, { 
            status: 500 
        });
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