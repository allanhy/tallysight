import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  const client = await db.connect();
  const { searchParams } = new URL(req.url);
  const leaderboard_id = searchParams.get('leaderboard_id');
  const contest_id = searchParams.get('contest_id');
  const user_id = searchParams.get('user_id');
  const rank = searchParams.get('rank');
  const points = searchParams.get('points');
 
  try {
    if (!leaderboard_id || !contest_id || !user_id || !rank || !points) throw new Error('leaderboard_id, contest_id, user_id, rank and points required');
    await client.sql`INSERT INTO admins (leaderboard_id, contest_id, user_id, rank, points) VALUES (${leaderboard_id}, ${contest_id}, ${user_id}, ${rank}, ${points}) ON CONFLICT (leaderboard_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const leaderboards = await client.sql`SELECT * FROM leaderboards;`;
  client.release();
  return NextResponse.json({ leaderboards }, { status: 200 });
}