import { sql } from '@vercel/postgres';
import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

//update favorite team
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const data = await req.json();
    const { teamName, teamLogoUrl } = data;

    if (!teamName) {
      return NextResponse.json({ success: false, message: 'Missing team name' }, { status: 400 });
    }

   
    await sql`
      UPDATE users 
      SET fav_team = ${teamName},
          fav_team_logo = ${teamLogoUrl}
      WHERE clerk_id = ${userId}
    `;

    return NextResponse.json({ success: true, message: 'Favorite team updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating favorite team:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update favorite team',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 