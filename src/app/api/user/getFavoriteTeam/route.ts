import { sql } from '@vercel/postgres';
import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';


export async function GET(req: NextRequest) {
  try {//get favorite team
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    // Get the user's favorite team data
    const result = await sql`
      SELECT fav_team, fav_team_logo
      FROM users
      WHERE clerk_id = ${userId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const teamData = result.rows[0];//return team data

    return NextResponse.json({ 
      success: true, 
      team: {
        fav_team: teamData.fav_team,
        fav_team_logo: teamData.fav_team_logo
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching favorite team:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch favorite team',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 