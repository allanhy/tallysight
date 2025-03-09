import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        // Log the userId for debugging
        console.log('Fetching picks for userId:', userId);

        const url = new URL(req.url);
        const dateParam = url.searchParams.get('date');

        let picks;
        if (dateParam) {
            const date = new Date(dateParam);
            picks = await sql`
                SELECT 
                    p.id as pick_id,
                    p."userId",
                    p."gameId",
                    p."teamIndex",
                    p."createdAt",
                    g.id as game_id,
                    g."team1Name",
                    g."team2Name",
                    g."team1Logo",
                    g."team2Logo",
                    g."won",
                    g."final_score",
                    g."winner",
                    g."gameDate"
                FROM "Pick" p
                JOIN "Game" g ON p."gameId" = g.id
                WHERE p."userId" = ${userId}
                AND g."gameDate" >= ${date.toISOString()}::date
                AND g."gameDate" < (${date.toISOString()}::date + interval '1 day')
                ORDER BY g."gameDate" ASC
            `;
        } else {
            // Log the SQL query for debugging
            console.log('Executing SQL query for all picks');
            
            picks = await sql`
                SELECT 
                    p.id as pick_id,
                    p."userId",
                    p."gameId",
                    p."teamIndex",
                    p."createdAt",
                    g.id as game_id,
                    g."team1Name",
                    g."team2Name",
                    g."team1Logo",
                    g."team2Logo",
                    g."won",
                    g."final_score",
                    g."winner",
                    g."gameDate"
                FROM "Pick" p
                JOIN "Game" g ON p."gameId" = g.id
                WHERE p."userId" = ${userId}
                ORDER BY g."gameDate" ASC
            `;
            
            // Log the raw result for debugging
            console.log('Raw SQL result:', picks.rows.length, 'rows found');
        }

        // Transform the data with correct IDs
        const formattedPicks = picks.rows.map(row => ({
            id: row.pick_id,
            userId: row.userId,
            gameId: row.gameId,
            teamIndex: row.teamIndex,
            createdAt: row.createdAt,
            Game: {
                id: row.game_id,
                team1Name: row.team1Name,
                team2Name: row.team2Name,
                team1Logo: row.team1Logo,
                team2Logo: row.team2Logo,
                winner: row.winner,
                final_score: row.final_score,
                gameDate: row.gameDate,
                // Derive status from other fields
                status: row.winner !== null ? 'STATUS_FINAL' : 'STATUS_SCHEDULED',
                // Add gameDay for compatibility with your interface
                gameDay: new Date(row.gameDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    timeZone: 'America/New_York'
                })
            }
        }));

        // Log the formatted result for debugging
        console.log('Formatted picks:', formattedPicks.length, 'picks returned');

        return NextResponse.json(formattedPicks);

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