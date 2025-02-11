import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function POST(req: Request) {
  const client = await db.connect();
  try{
    const data = await req.json();
    const { contest_id, contest_name, start_date, end_date, prize, status, description, category, participants, max_participants, max_entires, current_entries, rank } = data;

    if (!contest_id || !contest_name || !start_date || !end_date || !prize || !status || !description || !category || !participants || !max_participants || !max_entires || !current_entries) 
        throw new Error('contest_id, contest_name, start_date, end_date, prize, status required');

    await client.sql`INSERT INTO admins (contest_id, contest_name, start_date, end_date, prize, status, description, category, participants, max_participants, max_entires, current_entries, rank) VALUES (${contest_id}, ${contest_name}, ${start_date}, ${end_date}, ${prize}, ${status}, ${description}, ${category}, ${participants}, ${max_participants}, ${max_entires}, ${current_entries}, ${rank})  ON CONFLICT (contest_id) DO NOTHING;`;

    client.release();
    return NextResponse.json({message: 'Contest creation: Success'}, {status: 201});
  } catch (error) {
      client.release();
      return NextResponse.json({error}, {status: 500});
  }
}