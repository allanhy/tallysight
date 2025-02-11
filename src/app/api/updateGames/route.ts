import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NBA_TEAMS = [
    { name: 'Boston Celtics', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' },
    { name: 'Brooklyn Nets', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png' },
    { name: 'New York Knicks', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png' },
    { name: 'Philadelphia 76ers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png' },
    { name: 'Toronto Raptors', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png' },
    { name: 'Golden State Warriors', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png' },
    { name: 'LA Clippers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png' },
    { name: 'Los Angeles Lakers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
    { name: 'Phoenix Suns', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png' },
    { name: 'Sacramento Kings', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png' }
];

export async function GET() {
    try {
        const games = await prisma.game.findMany();
        console.log('Found games:', games);

        // Update each game with random NBA teams
        const updates = games.map(game => {
            // Pick two random teams
            const team1Index = Math.floor(Math.random() * NBA_TEAMS.length);
            let team2Index = Math.floor(Math.random() * NBA_TEAMS.length);
            // Make sure we don't pick the same team twice
            while (team2Index === team1Index) {
                team2Index = Math.floor(Math.random() * NBA_TEAMS.length);
            }

            return prisma.game.update({
                where: { id: game.id },
                data: {
                    team1Name: NBA_TEAMS[team1Index].name,
                    team2Name: NBA_TEAMS[team2Index].name,
                    team1Logo: NBA_TEAMS[team1Index].logo,
                    team2Logo: NBA_TEAMS[team2Index].logo
                }
            });
        });

        const updatedGames = await Promise.all(updates);
        console.log('Updated games:', updatedGames);

        return NextResponse.json({
            message: `Updated ${updatedGames.length} games with NBA teams`,
            games: updatedGames
        });
    } catch (error) {
        console.error('Update Games Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
} 