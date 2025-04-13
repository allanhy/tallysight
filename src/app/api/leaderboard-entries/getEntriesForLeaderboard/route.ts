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

    if(sport === 'SELECT'){
      if(week === '0'){
        // Update total points add all points from all leaderboards
        await client.query(`
          UPDATE users u
          SET points = subquery.points
          FROM (
            SELECT 
              u.user_id, 
              SUM(le.points) AS points
            FROM 
              users u
            JOIN 
              leaderboard_entries le ON u.user_id = le.user_id
            JOIN 
              leaderboards l ON le.leaderboard_id = l.leaderboard_id
            GROUP BY 
              u.user_id
          ) AS subquery
          WHERE u.user_id = subquery.user_id;
        `);

        const query = 
          `SELECT u.user_id, u.clerk_id, u.username, u.points, u.rank, u.performance, u.bio, u.fav_team, u.max_points
          FROM users u
          ORDER BY u.rank ASC, u.points DESC;`;
        users = await client.query(query);
    
      } else {
        const query = 
        `SELECT 
        u.user_id, 
        u.clerk_id, 
        u.username, 
        SUM(le.points) AS points,
        DENSE_RANK() OVER (ORDER BY SUM(le.points) DESC) AS rank,
        u.performance, 
        u.bio, 
        u.fav_team, 
        u.max_points
        FROM 
          users u
        JOIN 
          leaderboard_entries le ON u.user_id = le.user_id
        JOIN 
          leaderboards l ON le.leaderboard_id = l.leaderboard_id
        WHERE 
          l.week = $1
        GROUP BY 
          u.user_id, u.clerk_id, u.username, u.performance, u.bio, u.fav_team, u.max_points
        ORDER BY 
          rank ASC, points DESC;`;
        users = await client.query(query, [week]);
      }
    } else if (week === '0') { // Handle All Time (week = 0) case
      // First update ranks for all-time data (if needed)
      await client.query(`
        UPDATE users u
        SET rank = subquery.rank
        FROM (
          SELECT user_id, DENSE_RANK() OVER (ORDER BY 
            (SELECT COALESCE(SUM(points), 0) 
             FROM leaderboard_entries le
             JOIN leaderboards l ON le.leaderboard_id = l.leaderboard_id
             WHERE le.user_id = users.user_id AND l.sport = $1) DESC
          ) AS rank
          FROM users
        ) AS subquery
        WHERE u.user_id = subquery.user_id;
      `, [sport]);

      // Query to get all-time points for a given sport
      const query = `
        SELECT 
          u.user_id, 
          u.clerk_id, 
          u.username, 
          COALESCE(SUM(le.points), 0) as points,
          DENSE_RANK() OVER (ORDER BY COALESCE(SUM(le.points), 0) DESC) as rank,
          u.performance, 
          u.bio, 
          u.fav_team, 
          u.max_points
        FROM 
          users u
        JOIN 
          leaderboard_entries le ON u.user_id = le.user_id
        JOIN 
          leaderboards l ON le.leaderboard_id = l.leaderboard_id AND l.sport = $1
        GROUP BY 
          u.user_id, u.clerk_id, u.username, u.performance, u.bio, u.fav_team, u.max_points
        ORDER BY 
          rank ASC, points DESC;
      `;

      users = await client.query(query, [sport]);
    }
    else {
      // Updating rank before getting users
      await client.query(`
        UPDATE leaderboard_entries le
        SET rank = subquery.rank
        FROM (
          SELECT u.user_id, DENSE_RANK() OVER (ORDER BY u.points DESC) AS rank
          FROM users u
          JOIN leaderboard_entries le ON u.user_id = le.user_id
          WHERE le.leaderboard_id IN (
            SELECT leaderboard_id FROM leaderboards 
            WHERE sport = $1 AND week = $2 AND year = EXTRACT(YEAR FROM NOW())
          )
        ) AS subquery
         WHERE le.user_id = subquery.user_id
        AND le.leaderboard_id IN (
          SELECT leaderboard_id FROM leaderboards 
          WHERE sport = $1 AND week = $2 AND year = EXTRACT(YEAR FROM NOW())
        );
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
      return NextResponse.json({ success: true, data: [], message: `No ranking is available for ${sport} Week ${week}. Please choose another option.` }, { status: 200 });
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
