import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  const client = await db.connect();
  const { searchParams } = new URL(req.url);
  const pick_id = searchParams.get('pick_id');
  const user_id = searchParams.get('user_id');
  const event_id = searchParams.get('event_id');
  const amount = searchParams.get('amount');
  const payoff = searchParams.get('payoff');
  const status = searchParams.get('status');
  const date_placed = searchParams.get('date_placed');
 
  try {
    if (!pick_id || !user_id || !event_id || !amount || !payoff || !status || !date_placed) throw new Error('pick_id, user_id, event_id, amount, payoff, status and date placed required');
    await client.sql`INSERT INTO picks (pick_id, user_id, event_id, amount, payoff, status, date_placed) VALUES (${pick_id}, ${user_id}, ${event_id}, ${amount}, ${payoff}, ${status}, ${date_placed}) ON CONFLICT (bet_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const picks = await client.sql`SELECT * FROM picks;`;
  client.release();
  return NextResponse.json({ picks }, { status: 200 });
}