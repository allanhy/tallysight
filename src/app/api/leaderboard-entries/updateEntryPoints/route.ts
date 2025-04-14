/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const MAXPOINTSPERGAME = 1;
const BONUSPOINTS = 3;
const BESTPICKPOINTS = 3;
const UNDERDOGPOINTS = 2; // New constant for underdog bonus points

// Will update all user who entered that day's contest for specific sport and week
export async function POST(req: Request) {
    let client;

    try{
        client = await db.connect();
        await client.query('BEGIN'); // Make into atomic transaction for rollbacks

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
        
        // Get the games from today/yesterday depending on UTC time
        const games = await client.query(`
            SELECT * 
            FROM "Game"
            WHERE sport = $1 AND "gameDate" = (
                CASE 
                    WHEN EXTRACT(HOUR FROM NOW()) BETWEEN 0 AND 6 
                    THEN (CURRENT_DATE - INTERVAL '1 day') 
                    ELSE CURRENT_DATE 
                END);`
        , [sport]);

        /*
        console.log("games to update?");
        for(let i = 0; i < games.rows.length; i++){
            console.log(games.rows[i]);
        }
            */

        if(games.rows.length === 0){
            return NextResponse.json(
                { success: false, message: 'No games found for the selected date.' },
                { status: 404 }
            );
        }

        const gamesIds = games.rows.map(game => game.id);

        // Get users that made picks
        const usersPicked = await client.query(
            `SELECT "userId", "gameId", "teamIndex", "bestPick"
            FROM "Pick" 
            WHERE "gameId" = ANY($1)`
        , [gamesIds]);

        /*
        console.log("games to update?; users who made picks for these");
        for(let i = 0; i < usersPicked.rows.length; i++){
            console.log(usersPicked.rows[i]);
        }
            */

        // No users made picks for the games
        if (usersPicked.rows.length === 0 ){
            return NextResponse.json(
                { success: false, message: `No user picks found for todays games ${games.rows[0].gameDate}`},
                { status: 404}
            );
        }

        // Make based on won column
        const gameResults = (games.rows || games).map(game => ({
            gameId: game.id,
            won: game.won,
            is_underdog_win: game.is_underdog_win,
            underdog_team_id: game.underdog_team_id
        }));

        console.log(gameResults);

       //console.log('Game Results:', JSON.stringify(gameResults, null, 2));
 
        // For every row update their points
        for (const user of enteredUsers.rows){
            let gainedPoints = 0; // Points gained from picking correct team
            let gamesWon = 0; // Number of games won overall
            let maxPoints = 0;
            let bestPicked = false;

            console.log("user entry id: "+user.entry_id);

            for(const picked of usersPicked.rows){
                const game = gameResults.find(g => g.gameId.toString() === picked.gameId.toString());  // Get the first row
                // Only update if the right user and game.won is not null
                if (game && game.won !== null && game.won !== undefined && user.clerk_id === picked.userId) {
                    maxPoints += MAXPOINTSPERGAME;
                    if (game.won.toString() === picked.teamIndex.toString()) {
                        gainedPoints += MAXPOINTSPERGAME; // Point for picking correct team
                        gamesWon += 1;

                        // Check if this was an underdog pick that won
                        if (game.is_underdog_win && game.underdog_team_id === picked.teamIndex.toString()) {
                            gainedPoints += UNDERDOGPOINTS; // Add underdog bonus points
                        }

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

            console.log("current amount: " + user.points + " gained:" + gainedPoints);

            const leUpdate = await client.query(
                `UPDATE leaderboard_entries SET points = $1 WHERE entry_id = $2`
            , [totalPoints, user.entry_id]);

            if(leUpdate.rowCount === 0){
                console.warn(`Couldn't update leaderboard entry for entry_id ${user.entry_id}`);
            }

           //console.log(`Updating points for entry_id: ${user.entry_id}, totalPoints: ${totalPoints}`);

            // Call updatePoints api to post total points to user
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            const res = await fetch(`${BASE_URL}/api/user/updatePoints`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({ clerk_id: user.clerk_id, points: gainedPoints })
            });

           //console.log(`User ${user.clerk_id} gained ${gainedPoints} points`);

            if (!res.ok) {
                await client.query('ROLLBACK');
                return NextResponse.json({ success: false, message: data.message || 'Failed to update user total points after entry points update'}, { status: res.status });
            }

            const res2 = await fetch(`${BASE_URL}/api/user/updateMaxPoints`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({ clerk_id: user.clerk_id, max_points: maxPoints })
            });

            if (!res2.ok) {
                await client.query('ROLLBACK');
                return NextResponse.json({ success: false, message: data.message || 'Failed to update user total points after entry points update'}, { status: res2.status });
            }
        }
        
        await client.query('COMMIT');
        return NextResponse.json({ success: true, message: 'Entry points for all users updated successfully'}, {status: 200 });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error(`Error updating entry points: `, error);
        return NextResponse.json({ success: false, error: 'Internal server error '}, { status: 500 });
    } finally {
        if (client) client.release();
    }
}