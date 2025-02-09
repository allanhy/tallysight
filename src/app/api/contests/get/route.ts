/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  let client;
  try {
    client = await db.connect();
    const contests = await client.query(`SELECT * FROM contests;`);
    
    if (contests.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No contests available' }, { status: 404 });
    }
    return NextResponse.json({ success: true, contests: contests.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error Fetching Contests' }, { status: 500 });
  } finally {
    if(client) client.release();
  }
}
