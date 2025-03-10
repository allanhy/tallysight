import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Will update all user who entered that day's contest
export async function POST(req: Request) {
    let client;

    try{
        client = await db.connect();
        const data = await req.json();
        const { sport, week } = data;

        // winners should be an array
        if (!sport || !week) {
            return NextResponse.json(
                { success: false, message: 'Required Fields: sport, week, winners'},
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
            WHERE "gameDate" = (
                CASE 
                    WHEN EXTRACT(HOUR FROM NOW()) BETWEEN 0 AND 3 
                    THEN (CURRENT_DATE - INTERVAL '1 day') 
                    ELSE CURRENT_DATE 
                END);`
        );

        const gamesIds = games.rows.map(game => game.id);

        // Get users that made picks
        const usersPicked = await client.query(
            `SELECT "userId", "gameId", "teamIndex" 
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
        // make based on won column
        const gameResults = (games.rows || games).map(game => ({
            gameId: game.id,
            won: game.won
        }));

        console.log('Game Results:', JSON.stringify(gameResults, null, 2));
 
        // For every row update their points
        for(const user of enteredUsers.rows){
            let gainedPoints = 0;

            for(const picked of usersPicked.rows){
                const game = gameResults.find(g => g.gameId.toString() === picked.gameId.toString());  // Get the first row
            
                // Only update if the right user and game.won is not null
                if (game && game.won !== null && game.won !== undefined && user.clerk_id === picked.userId) {
                    if (game.won.toString() === picked.teamIndex.toString()) {
                        gainedPoints += 1;
                    }
                }
            }

            // 3 Bonus points for getting all correct
            if(gainedPoints === games.rows.length)
                gainedPoints += 3;

            const totalPoints = user.points+gainedPoints;

            await client.query(
                `UPDATE leaderboard_entries SET points = $1 WHERE entry_id = $2`
            , [totalPoints, user.entry_id]);

            console.log(`Updating points for entry_id: ${user.entry_id}, totalPoints: ${totalPoints}`);

            // Call updatePoints api to post total points to user
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            const res = await fetch(`${BASE_URL}/api/user/updatePoints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clerk_id: user.clerk_id, points: gainedPoints })
            });

            console.log(`User ${user.clerk_id} gained ${gainedPoints} points`);

            if (!res.ok) {
                return NextResponse.json({ success: false, message: data.message || 'Failed to update user total points after entry points update'}, { status: res.status });
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