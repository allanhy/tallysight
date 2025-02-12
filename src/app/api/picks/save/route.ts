import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { picks } = await req.json();

        // Save picks to Clerk user metadata
        const user = await clerkClient.users.getUser(userId);
        const existingPicks = user.privateMetadata.picks || [];
        
        await clerkClient.users.updateUser(userId, {
            privateMetadata: {
                picks: [...existingPicks, ...picks]
            }
        });

        return NextResponse.json({ success: true, picks });

    } catch (error) {
        console.error('Error saving picks:', error);
        return NextResponse.json(
            { error: 'Failed to save picks' },
            { status: 500 }
        );
    }
} 