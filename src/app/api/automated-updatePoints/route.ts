/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { handleAllGamesDone } from '@/lib/handleAllGamesDone/handleAllGamesDone';

export async function GET(req: NextRequest) {
    // Authorization check
    /*
    const authHeader = req.headers.get("Authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    try {
        await handleAllGamesDone();
        console.log('Cron for auto update points: success');
        return NextResponse.json({ message: 'Points updated successfully' });
    } catch (error) {
        console.error('Cron for auto update points failed:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to update points', 
                error: error instanceof Error ? error.message : String(error),
            }, 
            { status: 500 }
        );
    }
}
