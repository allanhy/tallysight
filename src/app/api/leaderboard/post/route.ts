/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function POST(req: Request) {
  let client;
  
  try{
    client = await db.connect();
    const data = await req.json();
    const { name, description, sport, week, start_date } = data;

    if (!name || !description || !sport || !week){ 
      return NextResponse.json(
        {success: false, message: 'Required Fields: name, description, sport, week'}, 
        {status:400}
      );
    }

    const result = await client.query(
      `INSERT INTO leaderboards (name, description)
      VALUES ($1, $2)
      RETURNING leaderboard_id, name, description, created_at;`,
      [name, description || null]
    );
    // double check index for result.rows[0], should be names?
    return NextResponse.json({ success: true, data: result.rows[0]}, {status: 201});
  } catch (error) {
      console.error('Error inserting into leaderboards:', error);

      return NextResponse.json(
        {sucess: false, message: 'Internal Server Error,', error}, 
        {status: 500}
      );
  } finally {
    if(client) client.release();
  }
}