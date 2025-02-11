import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function POST(req: Request) {
  let client;
  try{
    client = await db.connect();
    const data = await req.json();
    const { contest_id, contest_name, start_date, end_date, prize, status, description, category, participants, max_participants, max_entires, current_entries, rank } = data;

    if (!contest_id || !contest_name || !start_date || !end_date || !prize || !status || !description || !category || !participants || !max_participants || !max_entires || !current_entries) 
        throw new Error('Missing fields required: contest_id, contest_name, start_date, end_date, prize, status');

    await client.query(
      `INSERT INTO contests (contest_id, contest_name, start_date, end_date, prize, status, description, category, participants, max_participants, max_entires, current_entries, rank) 
      VALUES (${contest_id}, ${contest_name}, ${start_date}, ${end_date}, ${prize}, ${status}, ${description}, ${category}, ${participants}, ${max_participants}, ${max_entires}, ${current_entries}, ${rank})
      ON CONFLICT (contest_id) DO NOTHING;`);

    return NextResponse.json({ success: true, message: 'Contest creation: Success' }, { status: 201 });
  } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
  } finally {
    if(client) client = await db.connect();
  }
}