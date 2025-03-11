import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Get user point for one user to display on website
export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const { searchParams } = new URL(req.url);
    const clerk_id = searchParams.get('clerk_id');

    if(!clerk_id){
        return NextResponse.json({ success: false, message: 'Missing required field: clerk_id'});
    }

    const userPoint = await client.query(`SELECT points FROM users WHERE clerk_id = $1`, [clerk_id]);

    if (userPoint.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No user found' }, { status: 404 });
    }

    const point = parseInt(userPoint.rows[0].points, 10);

    return NextResponse.json({ success: true, data: point }, { status: 200 });
  } catch (error) {
    console.error("Error fetching point for user", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error: ' + error }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}