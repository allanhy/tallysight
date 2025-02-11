/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const {searchParams} = new URL(req.url);
    const sport = searchParams.get('sport');
    const week = searchParams.get('week');

    let query =
      `SELECT leaderboard_id, name, sport, week, description, start_date  
      FROM leaderboards
      WHERE 1=1`;

    const params: (string | number)[] = [];

    if(sport){
      query += ` AND sport = $${params.length+1}`;
      params.push(sport);
    }

    if(week){
      query += ` AND week = $${params.length+1}`;
      params.push(week);
    }

    query += ` ORDER BY week DESC;`;
    const leaderboards = await client.query(query, params);

    return NextResponse.json({ success: true, data:leaderboards.rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);

    return NextResponse.json({success: false, message: 'Internal Server Error Fetching Leaderboard' }, { status: 500 });
  } finally {
    if(client) client.release();
  }
}
