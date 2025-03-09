import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';


// Checks for user entry in week's leaderboard
export async function POST(req: Request) {
  let client;

  try {
    client = await db.connect();
    const data = await req.json();
    const { clerk_id, sport, week } = data;

    if (!clerk_id || !week || !sport) {
      return NextResponse.json(
        { success: false, message: 'Required Fields: clerk_id, week, sport' },
        { status: 400 }
      );
    }

    // Get user_id from clerk_id
    const userResult = await client.query(
      `SELECT user_id FROM users WHERE clerk_id = $1`,
      [clerk_id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    const user_id = userResult.rows[0].user_id;

    // Get leaderboard_id
    const leaderboardResult = await client.query(
      `SELECT leaderboard_id FROM leaderboards WHERE sport = $1 AND week = $2 AND year = EXTRACT(YEAR FROM NOW())`,
      [sport, week]
    );

    if (leaderboardResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Leaderboard not found for given ${sport}  ${week}` },
        { status: 404 }
      );
    }
    const leaderboard_id = leaderboardResult.rows[0].leaderboard_id;

    // Check if entry already exists
    const entryResult = await client.query(
      `SELECT * FROM leaderboard_entries WHERE user_id = $1 AND leaderboard_id = $2`,
      [user_id, leaderboard_id]
    );

    if (entryResult.rows.length === 0) {
      // Insert new entry
      await client.query(
        `INSERT INTO leaderboard_entries (user_id, leaderboard_id, rank, points, start_date) 
        VALUES ($1, $2, 0, $3, NOW())`,
        [user_id, leaderboard_id, 0]
      );
    }

    return NextResponse.json({ success: true, message: 'Leaderboard entry updated/created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error inserting into leaderboard entries:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', error },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
