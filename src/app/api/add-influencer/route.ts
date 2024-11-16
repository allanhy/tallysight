import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  const client = await db.connect();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const follower_count = searchParams.get('follower_count');
 
  try {
    if (!user_id || !follower_count) throw new Error('user_id, and follower_count required');
    await client.sql`INSERT INTO admins (user_id, follower_count) VALUES (${user_id}, ${follower_count})  ON CONFLICT (user_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const influencers = await client.sql`SELECT * FROM influencers;`;
  client.release();
  return NextResponse.json({ influencers }, { status: 200 });
}