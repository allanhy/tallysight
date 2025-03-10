import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: 'Clerk ID is required' },
        { status: 400 }
      );
    }

    // Fetch user data from Clerk
    const user = await clerkClient.users.getUser(clerkId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Extract social media links from unsafeMetadata
    const socialLinks = {
      x: user.unsafeMetadata?.x as string || '',
      instagram: user.unsafeMetadata?.instagram as string || '',
      discord: user.unsafeMetadata?.discord as string || '',
      facebook: user.unsafeMetadata?.facebook as string || '',
      snapchat: user.unsafeMetadata?.snapchat as string || '',
    };

    // Extract favorite team from unsafeMetadata
    const favoriteTeam = user.unsafeMetadata?.favoriteTeam || null;

    return NextResponse.json(
      { 
        success: true, 
        socialLinks,
        favoriteTeam
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error: ' + error },
      { status: 500 }
    );
  }
} 