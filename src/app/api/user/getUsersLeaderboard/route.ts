import { clerkClient, User } from '@clerk/clerk-sdk-node';
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const { searchParams } = new URL(req.url);
    const userIds = searchParams.get('user_id');

    // Updating rank before getting users
    await client.query(`
      UPDATE users
      SET rank = subquery.rank
      FROM (
          SELECT user_id, DENSE_RANK() OVER (ORDER BY points DESC) AS rank
          FROM users
      ) AS subquery
      WHERE users.user_id = subquery.user_id;
    `);

    let query = `SELECT * FROM users`;
    let values;

    if (userIds) {
      const idArray = userIds.split(',').map(id => parseInt(id.trim(), 10));
      query += ` WHERE user_id = ANY($1)`;
      values = [idArray];
    }

    // Making sure ranking/points order is correct
    query += ` ORDER BY rank ASC, points DESC`;
    
    const users = await client.query(query, values);

    if (users.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No users available' }, { status: 404 });
    }

    // Extract Clerk IDs and filter out invalid ones
    const clerkIds = users.rows.map(user => user.clerk_id).filter(id => id && id !== '-1');

    let clerkUsers: { data: User[] } | undefined;
    if (clerkIds.length > 0) {
      const response = await clerkClient.users.getUserList({ userId: clerkIds });

      if (Array.isArray(response?.data)) {  // Access the data property
          clerkUsers = response;
      } else {
          console.error("Unexpected Clerk API response:", response);
      }
    }

    // Merge users with Clerk images
    const mergedUsers = users.rows.map(user => {
      const clerkUser = Array.isArray(clerkUsers?.data)
        ? clerkUsers.data.find(cu => cu.id === user.clerk_id)
        : null;

      return {
        ...user,
        imageUrl: clerkUser?.imageUrl || '/default-profile.png',
      };
    });

    return NextResponse.json({ success: true, data: mergedUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error: ' + error }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}