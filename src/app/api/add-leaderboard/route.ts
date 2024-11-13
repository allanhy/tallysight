import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leaderboard_id = searchParams.get('leaderboard_id');
  const contest_id = searchParams.get('contest_id');
  const user_id = searchParams.get('user_id');
  const rank = searchParams.get('rank');
  const points = searchParams.get('points');
 
  try {
    if (!leaderboard_id || !contest_id || !user_id || !rank || !points) throw new Error('leaderboard_id, contest_id, user_id, rank and points required');
    await db`INSERT INTO admins (leaderboard_id, contest_id, user_id, rank, points) VALUES (${leaderboard_id}, ${contest_id}, ${user_id}, ${rank}, ${points}) ON CONFLICT (leaderboard_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const leaderboards = await db`SELECT * FROM leaderboards;`;
  return NextResponse.json({ leaderboards }, { status: 200 });
}