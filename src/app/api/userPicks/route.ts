import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        // Get date from query parameter
        const url = new URL(req.url);
        const dateParam = url.searchParams.get('date');

        let whereClause: any = { userId };

        if (dateParam) {
            const date = new Date(dateParam);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            whereClause.pickDate = {
                gte: date,
                lt: nextDay
            };
        }

        const picks = await prisma.pick.findMany({
            where: whereClause,
            include: {
                Game: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(picks);
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch picks' },
            { status: 500 }
        );
    }
}