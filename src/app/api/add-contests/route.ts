import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(req: Request) {
  const client = await db.connect();
  const { searchParams } = new URL(req.url);
  const contest_id = searchParams.get('contest_id');
  const contest_name = searchParams.get('contest_name');
  const start_date = searchParams.get('start_date');
  const end_date = searchParams.get('end_date');
  const prize = searchParams.get('prize');
  const status = searchParams.get('status');
 
  try {
    if (!contest_id || !contest_name || !start_date || !end_date || !prize || !status) throw new Error('contest_id, contest_name, start_date, end_date, prize, and status required');
    await client.sql`INSERT INTO admins (contest_id, contest_name, start_date, end_date, prize, status) VALUES (${contest_id}, ${contest_name}, ${start_date}, ${end_date}, ${prize}, ${status})  ON CONFLICT (contest_id) DO NOTHING;`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
 
  const contests = await client.sql`SELECT * FROM contests;`;
  client.release();
  return NextResponse.json({ contests }, { status: 200 });
}