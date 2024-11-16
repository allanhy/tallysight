import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  const client = await db.connect();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const username = searchParams.get('username');
  const email = searchParams.get('email');
  const password = searchParams.get('password');
  const role = searchParams.get('role');
  const current_balance = searchParams.get('current_balance');
  const ranking = searchParams.get('ranking');
 
  try {
    if (!user_id || !username || !email || !password || !role || !current_balance || !ranking) throw new Error('user_id, username, email, password, role, current_balance, and ranking required');
    await client.sql`INSERT INTO admins (user_id, username, email, password, role, current_balance, ranking) VALUES (${user_id}, ${username}, ${email}, ${password}, ${role}, ${current_balance}, ${ranking}) ON CONFLICT (user_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const users = await client.sql`SELECT * FROM users;`;
  client.release();
  return NextResponse.json({ users }, { status: 200 });
}