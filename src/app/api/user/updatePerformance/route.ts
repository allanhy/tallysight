import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let client;

  try {
    client = await db.connect();
    const data = await req.json();
    const { username, points, max_points } = data;

    if (!username || typeof username !== 'string' || !Number.isFinite(points) || !Number.isFinite(max_points)) {
      return NextResponse.json({ success: false, message: 'Missing or invalid fields: username, points, or max_points' }, { status: 400 });
    }

    // Calculate performance percentage
    const performance = max_points > 0 ? ((points / max_points) * 100).toFixed(3) : '0.000';

    await client.query(
      `UPDATE users 
       SET points = $1, max_points = $2, performance = $3 
       WHERE username = $4`, [points, max_points, performance, username]
    );

    return NextResponse.json({ success: true, message: 'User performance updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating performance:', error); // Log the error for debugging
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}