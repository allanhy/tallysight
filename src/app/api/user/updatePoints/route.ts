import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let client;

  try {
    client = await db.connect();
    const data = await req.json();
    const { clerk_id, points } = data;

    // Check data types
    if (!clerk_id || typeof points !== 'number'|| !Number.isFinite(points)) {
      return NextResponse.json({ success: false, message: 'Missing or invalid fields: clerk_id or points' }, { status: 400 });
    }

    // Get Current points
    const result = await client.query(
        `SELECT points FROM users WHERE users.clerk_id = $1`,
        [clerk_id]
    );

    // Add to points
    const previousPoints = Number(result.rows[0]?.points) || 0;
    const newPoints = previousPoints + points; 

    // Store points
    await client.query(
      `UPDATE users SET points = $1 WHERE clerk_id = $2`, 
      [newPoints, clerk_id]
    );

    return NextResponse.json({ success: true, message: 'User points updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating points:', error); // Log the error for debugging
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}