import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // First get the user_id from users table
    const user = await prisma.users.findUnique({
      where: {
        clerk_id: userId
      },
      select: {
        user_id: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const socialLinksString = JSON.stringify(data.socialLinks);

    await prisma.influencers.upsert({
      where: {
        user_id: user.user_id
      },
      update: {
        // user_handle: socialLinksString
      },
      create: {
        user_id: user.user_id,
        // user_handle: socialLinksString
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing social links:', error);
    return NextResponse.json(
      { error: 'Failed to sync social links' },
      { status: 500 }
    );
  }
} 