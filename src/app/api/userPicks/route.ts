import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        // Get date from query parameter
        const url = new URL(req.url);
        const dateParam = url.searchParams.get('date');

        let picks;
        if (dateParam) {
            const date = new Date(dateParam);
            // Query with date filter
            picks = await sql`
                SELECT p.*, g.*
                FROM "Pick" p
                JOIN "Game" g ON p."gameId" = g.id
                WHERE p."userId" = ${userId}
                AND g."gameDate" >= ${date.toISOString()}::date
                AND g."gameDate" < (${date.toISOString()}::date + interval '1 day')
                ORDER BY p."createdAt" DESC
            `;

            console.log('Fetched picks:', picks.rows); // Log the fetched data

            // Transform the data to match your expected format
            const formattedPicks = picks.rows.map(row => ({
                id: row.id,
                userId: row.userId,
                gameId: row.gameId,
                teamIndex: row.teamIndex,
                createdAt: row.createdAt,
                Game: {
                    id: row.id,
                    team1Name: row.team1Name,
                    team2Name: row.team2Name,
                    team1Logo: row.team1Logo,
                    team2Logo: row.team2Logo,
                    won: row.won,
                    final_score: row.final_score,
                    winner: row.winner,
                    gameDate: row.gameDate
                }
            }));

            console.log('Formatted picks:', formattedPicks); // Log the formatted data

            return NextResponse.json(formattedPicks);
        } else {
            // Query without date filter
            picks = await sql`
                SELECT p.*, g.*
                FROM "Pick" p
                JOIN "Game" g ON p."gameId" = g.id
                WHERE p."userId" = ${userId}
                ORDER BY p."createdAt" DESC
            `;

            // Transform the data to match your expected format
            const formattedPicks = picks.rows.map(row => ({
                id: row.id,
                userId: row.userId,
                gameId: row.gameId,
                teamIndex: row.teamIndex,
                createdAt: row.createdAt,
                Game: {
                    id: row.id,
                    team1Name: row.team1Name,
                    team2Name: row.team2Name,
                    team1Logo: row.team1Logo,
                    team2Logo: row.team2Logo,
                    won: row.won,
                    final_score: row.final_score,
                    winner: row.winner,
                    gameDate: row.gameDate
                }
            }));

            return NextResponse.json(formattedPicks);
        }

    } catch (error) {
        console.error('Error fetching picks:', error);
        return NextResponse.json(
            { 
                success: false,
                message: 'Failed to fetch picks',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}