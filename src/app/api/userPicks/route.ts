import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { format, parseISO, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Define an interface for the database row
interface PickRow {
    pick_id: string;
    userId: string;
    gameId: string;
    teamIndex: number;
    createdAt: Date;
    game_id: string;
    team1Name: string;
    team2Name: string;
    team1Logo: string;
    team2Logo: string;
    won: boolean | null;
    final_score: string | null;
    winner: number | null;
    gameDate: Date | string;
}

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
        try {
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
                    ORDER BY g."gameDate" DESC
                `;
                
                // Log the raw result for debugging
                console.log('Raw SQL result:', picks.rows.length, 'rows found');
            }
        } catch (sqlError) {
            console.error('SQL Error:', sqlError);
            return NextResponse.json(
                { 
                    success: false,
                    message: 'Database query failed',
                    error: sqlError instanceof Error ? sqlError.message : 'Unknown database error'
                },
                { status: 500 }
            );
        }

        // Transform the data with correct IDs and handle potential null values
        const formattedPicks = picks.rows.map((row: any) => {
            // Get current time in ET timezone
            const now = new Date();
            const timeZone = 'America/New_York';
            const etNow = toZonedTime(now, timeZone);
            
            // Parse game date in ET timezone
            let gameDate;
            if (row.gameDate) {
                // Check if gameDate is already a Date object
                if (row.gameDate instanceof Date) {
                    gameDate = row.gameDate;
                } else if (typeof row.gameDate === 'string') {
                    gameDate = parseISO(row.gameDate);
                } else {
                    // Fallback for other cases
                    console.log(`Unexpected gameDate type: ${typeof row.gameDate}`, row.gameDate);
                    gameDate = new Date(row.gameDate);
                }
            } else {
                gameDate = new Date();
            }
            
            // Don't convert to ET timezone for date comparisons
            const etGameDate = gameDate;
            
            // Log the game date for debugging
            console.log(`Game ID: ${row.game_id}, Raw Date: ${row.gameDate}`);
            console.log(`Game ID: ${row.game_id}, ET Date: ${format(etGameDate, 'yyyy-MM-dd HH:mm:ss')}`);
            
            // Determine game status
            let status;
            
            // IMPORTANT: First check if the game has a winner already
            if (row.winner !== null) {
                status = 'STATUS_FINAL'; // Game is complete
                console.log(`Game has explicit winner: ${row.game_id}, winner: ${row.winner}`);
            } else {
                // Check if the game is today in ET
                const isGameToday = 
                    etGameDate.getDate() === etNow.getDate() &&
                    etGameDate.getMonth() === etNow.getMonth() &&
                    etGameDate.getFullYear() === etNow.getFullYear();
                
                // Check if the game is in the future
                const isGameInFuture = etGameDate > etNow;
                
                console.log(`Game ${row.game_id}: Is today? ${isGameToday}, Is in future? ${isGameInFuture}`);
                
                if (isGameToday) {
                    // Game is today - check if it has started based on the time
                    const gameTime = etGameDate.getHours() * 60 + etGameDate.getMinutes(); // Convert to minutes
                    const currentTime = etNow.getHours() * 60 + etNow.getMinutes(); // Convert to minutes
                    
                    console.log(`Game ${row.game_id} time check: Game time: ${gameTime} minutes, Current time: ${currentTime} minutes`);
                    
                    if (gameTime > currentTime) {
                        // Game is later today
                        status = 'STATUS_SCHEDULED';
                        console.log(`Game today but not started yet: ${row.game_id}`);
                    } else {
                        // Game has started - check if it's likely still in progress
                        const minutesSinceStart = currentTime - gameTime;
                        
                        if (minutesSinceStart < 180) { // 3 hours = 180 minutes
                            // Game is likely still in progress
                            status = 'STATUS_IN_PROGRESS';
                            console.log(`Game in progress: ${row.game_id}, minutes since start: ${minutesSinceStart}`);
                        } else {
                            // Game has likely finished
                            status = 'STATUS_FINAL';
                            console.log(`Game likely finished: ${row.game_id}, minutes since start: ${minutesSinceStart}`);
                        }
                    }
                } else if (isGameInFuture) {
                    // Game is in the future
                    status = 'STATUS_SCHEDULED';
                    console.log(`Future game: ${row.game_id}`);
                } else {
                    // Game was in the past
                    status = 'STATUS_FINAL';
                    console.log(`Past game: ${row.game_id}`);
                }
            }
            
            console.log('Raw gameDate from DB:', row.gameDate);
            console.log('Parsed as Date object:', gameDate);
            console.log('Formatted in ET:', format(etGameDate, 'yyyy-MM-dd HH:mm:ss zzz'));
            
            return {
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
                    // Only include winner if the game is actually final
                    winner: status === 'STATUS_FINAL' ? row.winner : null,
                    final_score: status === 'STATUS_FINAL' ? row.final_score : null,
                    gameDate: row.gameDate,
                    status: status,
                    gameDay: format(gameDate, 'EEEE'), // Don't use etGameDate
                    formattedGameDate: format(gameDate, 'MMM d, yyyy h:mm a') // Remove timezone suffix
                }
            };
        });

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