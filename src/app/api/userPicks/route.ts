/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { format, parseISO, isAfter, isToday, differenceInMinutes } from 'date-fns';

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
    gameTime: Date | string;
    sport: string | null;
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const selectedSport = searchParams.get('sport') || 'NBA';

        // Log the userId for debugging
        //console.log('Fetching picks for userId:', userId);

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
                        p."bestPick",
                        g.id as game_id,
                        g."sport",
                        g."team1Name",
                        g."team2Name",
                        g."team1Logo",
                        g."team2Logo",
                        g."won",
                        g."final_score",
                        g."winner",
                        g."gameDate",
                        g."gameTime",
                        g."sport"
                    FROM "Pick" p
                    JOIN "Game" g ON p."gameId" = g.id AND p."sport" = g."sport"
                    WHERE p."userId" = ${userId}
                    AND g."gameDate" >= ${date.toISOString()}::date
                    AND g."gameDate" < (${date.toISOString()}::date + interval '1 day')
                    ORDER BY g."gameDate" ASC
                `;
            } else {
                // Log the SQL query for debugging
                //console.log('Executing SQL query for all picks');
                
                picks = await sql`
                    SELECT 
                        p.id as pick_id,
                        p."userId",
                        p."gameId",
                        p."teamIndex",
                        p."createdAt",
                        p."bestPick",
                        g.id as game_id,
                        g."sport",
                        g."team1Name",
                        g."team2Name",
                        g."team1Logo",
                        g."team2Logo",
                        g."won",
                        g."final_score",
                        g."winner",
                        g."gameDate",
                        g."gameTime",
                        g."sport"
                    FROM "Pick" p
                    JOIN "Game" g ON p."gameId" = g.id AND p."sport" = g."sport"
                    WHERE p."userId" = ${userId}
                    ORDER BY g."gameDate" DESC, p."createdAt" DESC
                `;
                
                // Log the raw result for debugging
                //console.log('Raw SQL result:', picks.rows.length, 'rows found');
            }
        } catch (sqlError) {
            //console.error('SQL Error:', sqlError);
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
            try {
                // Log raw values for debugging
                //console.log('Raw gameDate:', row.gameDate);
                //console.log('Raw gameTime:', row.gameTime);
                
                // Use the gameDate directly if it's already a complete datetime
                let finalDateTime;
                
                if (row.gameDate) {
                    // Parse the gameDate
                    let gameDateObj;
                    if (row.gameDate instanceof Date) {
                        gameDateObj = row.gameDate;
                    } else if (typeof row.gameDate === 'string') {
                        gameDateObj = new Date(row.gameDate);
                    } else {
                        //console.log(`Unexpected gameDate type: ${typeof row.gameDate}`);
                        gameDateObj = new Date();
                    }
                    
                    // If gameDate already has time information or gameTime is null, use it directly
                    if (!row.gameTime || gameDateObj.getHours() !== 0 || gameDateObj.getMinutes() !== 0) {
                        finalDateTime = gameDateObj;
                    } else {
                        // If we have a separate gameTime, parse it as a string
                        if (typeof row.gameTime === 'string') {
                            // Parse time string like "19:00:00"
                            const timeParts = row.gameTime.split(':').map(Number);
                            if (timeParts.length >= 2) {
                                // Create a new date with the date from gameDate and time from gameTime
                                finalDateTime = new Date(gameDateObj);
                                finalDateTime.setHours(timeParts[0], timeParts[1], timeParts[2] || 0);
                            } else {
                                finalDateTime = gameDateObj;
                            }
                        } else if (row.gameTime instanceof Date) {
                            // If gameTime is a Date object, extract hours/minutes/seconds
                            finalDateTime = new Date(gameDateObj);
                            finalDateTime.setHours(
                                row.gameTime.getHours(),
                                row.gameTime.getMinutes(),
                                row.gameTime.getSeconds()
                            );
                        } else {
                            finalDateTime = gameDateObj;
                        }
                    }
                } else {
                    // Fallback if no date is available
                    finalDateTime = new Date();
                }
                
                // Validate the date
                if (isNaN(finalDateTime.getTime())) {
                    //console.log('Invalid date created, using current date instead');
                    finalDateTime = new Date();
                }
                
                //console.log(`Final DateTime: ${finalDateTime.toISOString()}`);
                
                // IMPORTANT: Adjust for Eastern Time (ET) to UTC conversion
                // ET is UTC-4 or UTC-5 depending on daylight saving
                // For simplicity, we'll use a fixed offset of -4 hours (ET during daylight saving)
                // This assumes the database times are in ET
                const etOffsetHours = 4; // 4 hours during EDT, 5 during EST
                const utcDateTime = new Date(finalDateTime.getTime() + (etOffsetHours * 60 * 60 * 1000));
                
                // Store the UTC ISO string
                const utcIsoString = utcDateTime.toISOString();
                
                //console.log(`Adjusted UTC DateTime: ${utcIsoString}`);
                
                // Format with explicit date and timezone
                const formattedDate = format(finalDateTime, 'MMM d, yyyy h:mm a') + ' ET';
                
                // Determine game status
                let status;
                
                // IMPORTANT: First check if the game has a winner already
                if (row.winner !== null) {
                    status = 'STATUS_FINAL';
                } else {
                    // Use UTC for all comparisons to avoid timezone issues
                    const now = new Date();
                    const isGameInFuture = finalDateTime > now;
                    
                    // Check if the game is today in UTC
                    const isGameToday = 
                        finalDateTime.getFullYear() === now.getFullYear() &&
                        finalDateTime.getMonth() === now.getMonth() &&
                        finalDateTime.getDate() === now.getDate();
                    
                    //console.log(`Game ${row.game_id}: UTC Date: ${finalDateTime.toISOString()}, Is today in UTC? ${isGameToday}, Is in future in UTC? ${isGameInFuture}`);
                    
                    if (isGameToday) {
                        // Game is today - check if it has started based on the time
                        if (isGameInFuture) {
                            // Game is later today
                            status = 'STATUS_SCHEDULED';
                            //console.log(`Game today but not started yet: ${row.game_id}`);
                        } else {
                            // Game has started - check if it's likely still in progress
                            const minutesSinceStart = differenceInMinutes(now, finalDateTime);
                            
                            if (minutesSinceStart < 180) { // 3 hours = 180 minutes
                                // Game is likely still in progress
                                status = 'STATUS_IN_PROGRESS';
                                //console.log(`Game in progress: ${row.game_id}, minutes since start: ${minutesSinceStart}`);
                            } else {
                                // Game has likely finished
                                status = 'STATUS_FINAL';
                                //console.log(`Game likely finished: ${row.game_id}, minutes since start: ${minutesSinceStart}`);
                            }
                        }
                    } else if (isGameInFuture) {
                        // Game is in the future
                        status = 'STATUS_SCHEDULED';
                        //console.log(`Future game: ${row.game_id}`);
                    } else {
                        // Game was in the past
                        status = 'STATUS_FINAL';
                        //console.log(`Past game: ${row.game_id}`);
                    }
                }
                
                return {
                    id: row.pick_id,
                    userId: row.userId,
                    gameId: row.gameId,
                    teamIndex: row.teamIndex,
                    createdAt: row.createdAt,
                    bestPick: row.bestPick,
                    Game: {
                        id: row.game_id,
                        team1Name: row.team1Name,
                        team2Name: row.team2Name,
                        team1Logo: row.team1Logo,
                        team2Logo: row.team2Logo,
                        winner: status === 'STATUS_FINAL' ? row.winner : null,
                        final_score: status === 'STATUS_FINAL' ? row.final_score : null,
                        gameDate: utcIsoString,
                        status: status,
                        gameDay: format(finalDateTime, 'EEEE'),
                        formattedGameDate: formattedDate,
                        sport: row.sport || 'Unknown'
                    }
                };
            } catch (error) {
                //console.error('Error processing row:', error);
                
                // Return a fallback object with the current date
                const fallbackDate = new Date();
                return {
                    id: row.pick_id || 'unknown',
                    userId: row.userId || 'unknown',
                    gameId: row.gameId || 'unknown',
                    teamIndex: row.teamIndex || 0,
                    createdAt: row.createdAt || fallbackDate.toISOString(),
                    bestPick: row.bestPick || null,
                    Game: {
                        id: row.game_id || 'unknown',
                        team1Name: row.team1Name || 'Team 1',
                        team2Name: row.team2Name || 'Team 2',
                        team1Logo: row.team1Logo || '',
                        team2Logo: row.team2Logo || '',
                        winner: null,
                        final_score: null,
                        gameDate: fallbackDate.toISOString(),
                        status: 'STATUS_SCHEDULED',
                        gameDay: format(fallbackDate, 'EEEE'),
                        formattedGameDate: format(fallbackDate, 'MMM d, yyyy h:mm a') + ' ET',
                        sport: 'Unknown'
                    }
                };
            }
        });

        // Log the formatted result for debugging
        //console.log('Formatted picks:', formattedPicks.length, 'picks returned');
        
        // Make sure we're not filtering out any picks accidentally
        if (formattedPicks.length < picks.rows.length) {
            //console.warn(`Warning: Some picks were filtered out. Original: ${picks.rows.length}, Formatted: ${formattedPicks.length}`);
        }
        
        // Sort the picks by date (newest first)
        const sortedPicks = formattedPicks.sort((a, b) => {
            try {
                const dateA = new Date(a.Game.gameDate);
                const dateB = new Date(b.Game.gameDate);
                
                // Primary sort by game date (newest first)
                const dateDiff = dateB.getTime() - dateA.getTime();
                
                // If game dates are the same, sort by pick creation date
                if (dateDiff === 0 && a.createdAt && b.createdAt) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                
                return dateDiff;
            } catch (error) {
                //console.error('Error sorting picks:', error);
                return 0;
            }
        });
        
        //console.log('Returning sorted picks:', sortedPicks.length);
        
        return NextResponse.json(sortedPicks);

    } catch (error) {
        //console.error('Error in GET request:', error);
        return NextResponse.json(
            { 
                success: false,
                message: 'Request failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}