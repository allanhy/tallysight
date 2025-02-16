import { NextResponse } from 'next/server';

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day') || 'today';

    try {
        const response = await fetch(
            `${BASE_URL}/basketball_nba/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=spreads&oddsFormat=american`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch odds data');
        }

        const data = await response.json();
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filter games based on the requested day
        const filteredGames = data.filter((game: any) => {
            const gameDate = new Date(game.commence_time);
            return day === 'today' 
                ? gameDate.getDate() === now.getDate()
                : gameDate.getDate() === tomorrow.getDate();
        });

        const games = filteredGames.map((game: any) => ({
            id: game.id,
            homeTeam: {
                name: game.home_team,
                score: null,
                spread: game.bookmakers[0]?.markets.find((m: any) => m.key === 'spreads')
                    ?.outcomes.find((o: any) => o.name === game.home_team)?.point || 'N/A',
            },
            awayTeam: {
                name: game.away_team,
                score: null,
                spread: game.bookmakers[0]?.markets.find((m: any) => m.key === 'spreads')
                    ?.outcomes.find((o: any) => o.name === game.away_team)?.point || 'N/A',
            },
            gameTime: new Date(game.commence_time).toLocaleTimeString(),
            status: 'scheduled',
        }));

        return NextResponse.json(games);
    } catch (error) {
        console.error('Error fetching NBA games:', error);
        return NextResponse.json({ error: 'Failed to fetch NBA games' }, { status: 500 });
    }
}