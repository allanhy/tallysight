import { clerkClient, User } from '@clerk/clerk-sdk-node';
import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Get users' points for a specific sport (all-time or by week)
export async function GET(req: Request) {
  let client;

  try {
    client = await db.connect();
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get('sport');
    const week = searchParams.get('week');

    console.log(`API request - Sport: ${sport}, Week: ${week}`);

   

    let users;

    if (week === '0' || !week) {
      // For all-time sport-specific leaderboard
      
      
      // This query calculates the sum of points for each user only from the specified sport and ensures only users who have actually played appear
    
      const query = `
        WITH sport_points AS (
          SELECT 
            u.user_id,
            SUM(le.points) AS total_points
          FROM 
            users u
          JOIN 
            leaderboard_entries le ON u.user_id = le.user_id
          JOIN 
            leaderboards l ON le.leaderboard_id = l.leaderboard_id
          WHERE 
            l.sport = $1
          GROUP BY 
            u.user_id
          HAVING 
            SUM(le.points) > 0
        )
        SELECT 
          u.user_id, 
          u.clerk_id, 
          u.username, 
          sp.total_points AS points,
          DENSE_RANK() OVER (ORDER BY sp.total_points DESC) AS rank,
          u.performance, 
          u.bio, 
          u.fav_team, 
          u.max_points
        FROM 
          users u
        JOIN 
          sport_points sp ON u.user_id = sp.user_id
        ORDER BY 
          rank ASC, points DESC;
      `;
      
      users = await client.query(query, [sport]);
      
      
      // Log the first few users and their points debugging
      if (users.rows.length > 0) {
        console.log("Sample user points:");
        users.rows.slice(0, 3).forEach(user => {
          
        });
      }
    } else {
      //specific week and sport
      
      const query = `
        SELECT 
          u.user_id, 
          u.clerk_id, 
          u.username, 
          le.points,
          DENSE_RANK() OVER (ORDER BY le.points DESC) AS rank,
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
          l.sport = $1 
          AND l.week = $2 
          AND l.year = EXTRACT(YEAR FROM NOW())
          AND le.points > 0
        ORDER BY 
          rank ASC, le.points DESC;
      `;
      
      users = await client.query(query, [sport, week]);
      
    }

    if (users.rows.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [], 
        message: `No users found for ${sport} ${week === '0' ? 'All Time' : `Week ${week}`}.` 
      }, { status: 200 });
    }

    
    const clerkIds = users.rows.map(user => user.clerk_id).filter(id => id && id !== '-1');

    let clerkUsers: { data: User[] } | undefined;
    if (clerkIds.length > 0) {
      const response = await clerkClient.users.getUserList({ userId: clerkIds });

      if (Array.isArray(response?.data)) {
        clerkUsers = response;
      } else {
        console.error("Unexpected Clerk API response:", response);
      }
    }

    
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
    console.error(`Error fetching sport-specific points: ${error}`);
    return NextResponse.json({ success: false, message: `Internal Server Error: ${error}` }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
