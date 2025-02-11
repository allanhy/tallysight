/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const contests = await client.sql`SELECT * FROM contests;`;
    
    if (contests.rows.length === 0) {
      return NextResponse.json({ message: 'No contests available' }, { status: 404 });
    }
    return NextResponse.json({ contests: contests.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error Fetching Contests' }, { status: 500 });
  } finally {
    client.release();
  }
}
