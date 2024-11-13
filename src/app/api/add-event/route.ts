import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const event_id = searchParams.get('event_id');
  const game_name = searchParams.get('game_name');
  const date = searchParams.get('date');
  const odds = searchParams.get('odds');
  const sport_type = searchParams.get('sport_type');

try{
  if (!event_id || !game_name || !date || !odds || !sport_type) throw new Error('event_id, game_name, date, odds, and sport_type are required');
    await db`INSERT INTO events (event_id, game_name, date, odds, sport_type) VALUES (${event_id}, ${game_name}, ${date}, ${odds}, ${sport_type})  ON CONFLICT (event_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

    const events = await db`SELECT * FROM events;`;
    return NextResponse.json({ events }, { status: 200 });
}
