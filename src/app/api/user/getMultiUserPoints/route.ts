import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Get user point for multiple users to display on website
export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const { searchParams } = new URL(req.url);
    const userIds = searchParams.get('user_id');

    if(!userIds || userIds.trim() === ""){
        return NextResponse.json({ success: false, message: 'Missing required field: user_id(s)'});
    }

    let query = `SELECT user_id, points FROM users`;
    let values;

    if(userIds){
        const idArray =[...new Set(userIds.split(',').map(id => id.trim()).filter(Boolean))];
        query += ` WHERE user_id = ANY($1)`;
        values = [idArray];
    }

    query += `;`;

    const userPoints = await client.query(query, values);

    if (userPoints.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No users found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: userPoints.rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching points for users", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error: ' + error }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}