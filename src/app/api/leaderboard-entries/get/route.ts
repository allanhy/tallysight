/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const {searchParams} = new URL(req.url);
    //const leaderboard_id = searchParams.get('leaderboard_id');
    const sport = searchParams.get('sport');
    const week = searchParams.get('week')
    
    if (/*!leaderboard_id ||*/ !sport || !week) {
      return NextResponse.json({success: false, message: 'Missing Fields Required: leaderboard_id, sport, week' }, { status: 400 });
    }

    let users;

    if( sport === 'SELECT' || week === '-1'){
      const query = 
        `SELECT u.user_id, u.username, u.points, u.rank
        FROM users u
        ORDER BY u.rank ASC, u.points DESC;`;
        users = await client.query(query);

    } else {

      // for leaderboard_id implementation

      /*const query =
        `SELECT entry_id, u.user_id, u.username, le.rank, le.points, le.start_date
        FROM leaderboard_entries le
        JOIN users u ON le.user_id = u.user_id
        JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
        WHERE le.leaderboard_id = $1 AND l.sport = $2 AND le.week = $3
        ORDER BY le.rank ASC`;

        const values = [leaderboard_id, sport, week];
        */

      const query = 
        `SELECT u.user_id, u.username, le.points, le.rank
        FROM users u
        JOIN leaderboard_entries le ON u.user_id = le.user_id
        JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
        WHERE l.sport = $1 AND l.week = $2
        ORDER BY le.rank ASC, le.points DESC;`;

      const values = [sport, week];

      users = await client.query(query, values);
    }

    if (users.rows.length === 0) {
      return NextResponse.json({ success: false, message: `No ranking is available for ${sport} Week ${week}. Please choose another option.` }, { status: 404 });
    }

    return NextResponse.json({ success: true, data:users.rows }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching user entries: ${error}`);

    return NextResponse.json({success: false, message: `Internal Server Error Fetching User Entries: ${error}` }, { status: 500 });
  } finally {
    if(client) client.release();
  }
}
