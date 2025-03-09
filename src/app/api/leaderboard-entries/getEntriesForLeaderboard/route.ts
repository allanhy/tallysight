/* eslint-disable @typescript-eslint/no-unused-vars */
import { clerkClient, User } from '@clerk/clerk-sdk-node';
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// get users for specific sport and week leaderboard
export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const {searchParams} = new URL(req.url);
    //const leaderboard_id = searchParams.get('leaderboard_id');
    const sport = searchParams.get('sport');
    const week = searchParams.get('week')
    
    if (/*!leaderboard_id ||*/ !sport || !week) {
      return NextResponse.json({success: false, message: 'Missing Fields Required: leaderboard_id, sport, week' }, { status: 400 });
    }

    let users;

    if( sport === 'SELECT' || week === '-1'){
      const query = 
        `SELECT u.user_id, u.clerk_id, u.username, u.points, u.rank, u.performance, u.bio, u.fav_team, u.max_points
        FROM users u
        ORDER BY u.rank ASC, u.points DESC;`;
        users = await client.query(query);

    } else {

      // for leaderboard_id implementation

      /*const query =
        `SELECT entry_id, u.user_id, u.username, le.rank, le.points, le.start_date
        FROM leaderboard_entries le
        JOIN users u ON le.user_id = u.user_id
        JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
        WHERE le.leaderboard_id = $1 AND l.sport = $2 AND le.week = $3
        ORDER BY le.rank ASC`;

        const values = [leaderboard_id, sport, week];
      */

      // Updating rank before getting users
      await client.query(`
        UPDATE leaderboard_entries
        SET rank = subquery.rank
        FROM (
          SELECT user_id, DENSE_RANK() OVER (ORDER BY points DESC) AS rank
          FROM users
        ) AS subquery
        WHERE leaderboard_entries.user_id = subquery.user_id
        AND leaderboard_entries.leaderboard_id IN (SELECT leaderboard_id FROM leaderboards WHERE sport = $1 AND week = $2 AND year = EXTRACT(YEAR FROM NOW()));
      `, [sport, week]);

      const query = 
        `SELECT u.user_id, u.clerk_id, u.username, le.points, le.rank, u.performance, u.bio, u.fav_team, u.max_points
        FROM users u
        JOIN leaderboard_entries le ON u.user_id = le.user_id
        JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
        WHERE l.sport = $1 AND l.week = $2 AND l.year = EXTRACT(YEAR FROM NOW())
        ORDER BY le.rank ASC, le.points DESC;`;

      const values = [sport, week];

      users = await client.query(query, values);
    }

    if (users.rows.length === 0) {
      return NextResponse.json({ success: false, message: `No ranking is available for ${sport} Week ${week}. Please choose another option.` }, { status: 404 });
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
    console.error(`Error fetching user entries: ${error}`);

    return NextResponse.json({success: false, message: `Internal Server Error Fetching User Entries: ${error}` }, { status: 500 });
  } finally {
    if(client) client.release();
  }
}
