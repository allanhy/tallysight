import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bet_id = searchParams.get('bet_id');
  const user_id = searchParams.get('user_id');
  const event_id = searchParams.get('event_id');
  const amount = searchParams.get('amount');
  const payoff = searchParams.get('payoff');
  const status = searchParams.get('status');
  const date_placed = searchParams.get('date_placed');
 
  try {
    if (!bet_id || !user_id || !event_id || !amount || !payoff || !status || !date_placed) throw new Error('bet id, user id, event id, amount, payoff, status and date placed required');
    await db`INSERT INTO bets (bet_id, user_id, event_id, amount, payoff, status, date_placed) VALUES (${bet_id}, ${user_id}, ${event_id}, ${amount}, ${payoff}, ${status}, ${date_placed}) ON CONFLICT (bet_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const bets = await db`SELECT * FROM bets;`;
  return NextResponse.json({ bets }, { status: 200 });
}