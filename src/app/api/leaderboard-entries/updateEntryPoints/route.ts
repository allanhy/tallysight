/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { flushAllTraces } from 'next/dist/trace';
import { NextResponse } from 'next/server';

const MAXPOINTSPERGAME = 1;
const BONUSPOINTS = 3;
const BESTPICKPOINTS = 3;

// Will update all user who entered that day's contest
export async function POST(req: Request) {
    let client;

    try{
        client = await db.connect();
        const data = await req.json();
        const { sport, week } = data;

        if (!sport || !week) {
            return NextResponse.json(
                { success: false, message: 'Required Fields: sport, week'},
                { status: 400}
            );
        }

        // Get users with entries into that week's leaderboard
        const enteredUsers = await client.query(
            `SELECT le.entry_id, le.user_id, u.clerk_id, le.points
            FROM leaderboard_entries le 
            INNER JOIN users u ON le.user_id = u.user_id
            WHERE le.leaderboard_id = (SELECT leaderboard_id FROM leaderboards 
                                    WHERE sport = $1 AND week = $2 AND year = EXTRACT(YEAR FROM NOW())) 
            `, [sport , week]);
        
        // Get the games from yesterday
        const games = await client.query(`
            SELECT * 
            FROM "Game"
            WHERE sport = $1 AND "gameDate" = (
                CASE 
                    WHEN EXTRACT(HOUR FROM NOW()) BETWEEN 0 AND 3 
                    THEN (CURRENT_DATE - INTERVAL '1 day') 
                    ELSE CURRENT_DATE 
                END);`
        , [sport]);

        const gamesIds = games.rows.map(game => game.id);

        // Get users that made picks
        const usersPicked = await client.query(
            `SELECT "userId", "gameId", "teamIndex", "bestPick"
            FROM "Pick" 
            WHERE "gameId" = ANY($1)`
        , [gamesIds]);

        // No users made picks for the games
        if (usersPicked.rows.length === 0 ){
            return NextResponse.json(
                { success: false, message: 'No user picks found for yesterdays games'},
                { status: 404}
            );
        }

        // Make based on won column
        const gameResults = (games.rows || games).map(game => ({
            gameId: game.id,
            won: game.won
        }));

        console.log(gameResults);

       //console.log('Game Results:', JSON.stringify(gameResults, null, 2));
 
        // For every row update their points
        for (const user of enteredUsers.rows){
            let gainedPoints = 0; // Points gained from picking correct team
            let gamesWon = 0; // Number of games won overall
            let maxPoints = 0;
            let bestPicked = false;

            for(const picked of usersPicked.rows){
                const game = gameResults.find(g => g.gameId.toString() === picked.gameId.toString());  // Get the first row
                // Only update if the right user and game.won is not null
                if (game && game.won !== null && game.won !== undefined && user.clerk_id === picked.userId) {
                    maxPoints += MAXPOINTSPERGAME;
                    if (game.won.toString() === picked.teamIndex.toString()) {
                        gainedPoints += MAXPOINTSPERGAME; // Point for picking correct team
                        gamesWon += 1;
                        if (picked.bestPick) // Game was their best pick
                            gainedPoints += BESTPICKPOINTS; // Add best pick points
                    }
                }

                // Update max points if best picks made
                if(picked.bestPick)
                    bestPicked = true;
            }

            if(bestPicked)
                maxPoints += BONUSPOINTS;

            // 3 Bonus points for getting all correct
            if (gamesWon === games.rows.length)
                gainedPoints += BONUSPOINTS;

            // Bonus max point add
            maxPoints += BESTPICKPOINTS;

            const totalPoints = user.points+gainedPoints;

            await client.query(
                `UPDATE leaderboard_entries SET points = $1 WHERE entry_id = $2`
            , [totalPoints, user.entry_id]);

           //console.log(`Updating points for entry_id: ${user.entry_id}, totalPoints: ${totalPoints}`);

            // Call updatePoints api to post total points to user
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            const res = await fetch(`${BASE_URL}/api/user/updatePoints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clerk_id: user.clerk_id, points: gainedPoints })
            });

           //console.log(`User ${user.clerk_id} gained ${gainedPoints} points`);

            if (!res.ok) {
                return NextResponse.json({ success: false, message: data.message || 'Failed to update user total points after entry points update'}, { status: res.status });
            }

            const res2 = await fetch(`${BASE_URL}/api/user/updateMaxPoints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clerk_id: user.clerk_id, max_points: maxPoints })
            });

            if (!res2.ok) {
                return NextResponse.json({ success: false, message: data.message || 'Failed to update user total points after entry points update'}, { status: res2.status });
            }
        }

        return NextResponse.json({ success: true, message: 'Entry points for all users updated successfully'}, {status: 200 });
    } catch (error) {
        console.error(`Error updating entry points: `, error);
        return NextResponse.json({ success: false, error: 'Internal server error '}, { status: 500 });
    } finally {
        if (client) client.release();
    }
}