import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let client;

  try {
    client = await db.connect();
    
    const data = await req.json();
    const { clerk_id, max_points } = data;

    // Check data types
    if (!clerk_id || typeof max_points !== 'number'|| !Number.isFinite(max_points)) {
      return NextResponse.json({ success: false, message: 'Missing or invalid fields: clerk_id or max_points' }, { status: 400 });
    }

    // Get Current max_points
    const result = await client.query(
        `SELECT max_points FROM users WHERE users.clerk_id = $1`,
        [clerk_id]
    );

    // Add to max_points
    const previousMaxPoints = Number(result.rows[0]?.max_points) || 0;
    const newMaxPoints = previousMaxPoints + max_points; 

    // Store max_points
    await client.query(
      `UPDATE users SET max_points = $1 WHERE clerk_id = $2`, 
      [newMaxPoints, clerk_id]
    );

    return NextResponse.json({ success: true, message: 'User max points updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating max points:', error); // Log the error for debugging
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}