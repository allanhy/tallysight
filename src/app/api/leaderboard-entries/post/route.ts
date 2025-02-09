import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function POST(req: Request) {
  let client;
  
  try{
    client = await db.connect();

    const data = await req.json();
    const { entry_id, user_id, leaderboard_id, rank, points, start_date} = data;

    if (!entry_id || !user_id || !leaderboard_id){ 
      return NextResponse.json(
        { success: false, message: 'Required Fields: entry_id, user_id, leaderboard_id' }, 
        { status:400 }
      );
    }

    if(rank==undefined) data.rank = 0;
    if(points==undefined) data.points = 0;
    if(!start_date) data.start_date = new Date().toISOString();

    await client.query(
      `INSERT INTO leaderboard_entries (entry_id, user_id, leaderboard_id, rank, points, start_date) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (leaderboard_id, user_id) 
      DO UPDATE SET rank = EXCLUDED.rank, points = EXCLUDED.points, start_date = EXCLUDED.start_date;`,
      [entry_id, user_id, leaderboard_id, rank, points, start_date]
    );

    return NextResponse.json({ success: true, message: 'Leaderboard Entry creation: Success'}, {status: 201});
  } catch (error) {
      console.error('Error inserting into leaderboard entries:', error);

      return NextResponse.json(
        {success: false, message: 'Internal Server Error,', error}, 
        {status: 500}
      );
  } finally {
    if(client) client.release();
  }
}