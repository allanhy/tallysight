import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Get all unique gameIds from picks
        const picks = await prisma.pick.findMany();
        const uniqueGameIds = [...new Set(picks.map(pick => pick.gameId))];
        
        // Create games for each unique gameId
        const createdGames = await Promise.all(
            uniqueGameIds.map(gameId =>
                prisma.game.create({
                    data: {
                        id: gameId,
                        team1Name: "Team 1",  // Placeholder
                        team2Name: "Team 2",  // Placeholder
                        team1Logo: null,
                        team2Logo: null
                    }
                })
            )
        );

        return NextResponse.json({
            message: `Created ${createdGames.length} games`,
            games: createdGames
        });
    } catch (error) {
        console.error('Create Games Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
} 