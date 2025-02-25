import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import axios from 'axios';

const prisma = new PrismaClient();
const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get ESPN data first
        const espnResponse = await axios.get(ESPN_API);
        const gameDates = new Map();
        
        // Map game dates with detailed logging
        espnResponse.data.events.forEach((event: any) => {
            const gameDate = new Date(event.date);
            gameDates.set(event.id, gameDate);
            console.log(`Mapped Game ID ${event.id} to Date: ${gameDate}`);
        });

        console.log('ESPN API Response:', espnResponse.data);

        // Get picks after mapping dates
        const picks = await prisma.pick.findMany({
            where: { userId },
            include: { Game: true }
        });

        console.log('Game Dates Map:', Array.from(gameDates.entries()));
        console.log('Picks:', picks.map(pick => pick.gameId));

        // Group picks by game date
        const groupedPicks = picks.reduce((acc: { [key: string]: any[] }, pick) => {
            const gameDate = gameDates.get(pick.gameId) || 'Unknown Date';
            if (!acc[gameDate]) {
                acc[gameDate] = [];
            }
            acc[gameDate].push(pick);
            return acc;
        }, {});

        // Sort with detailed logging
        const sortedPicks = [...picks].sort((a, b) => {
            const dateA = gameDates.get(a.gameId);
            const dateB = gameDates.get(b.gameId);
            
            console.log(`Pick ${a.gameId} date: ${dateA}`);
            console.log(`Pick ${b.gameId} date: ${dateB}`);
            
            if (!dateA || !dateB) {
                console.warn(`Missing date for Pick ID ${a.gameId}: ${dateA}, ${b.gameId}: ${dateB}`);
                return 0;
            }
            
            return dateA.getTime() - dateB.getTime();
        });

        console.log('Final sorted picks:', sortedPicks.map(p => ({ id: p.gameId, date: gameDates.get(p.gameId) })));
        return NextResponse.json(sortedPicks);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch picks' }, { status: 500 });
    }
}