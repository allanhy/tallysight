import { NextResponse } from 'next/server';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

export async function GET() {
  try {
    // Fetch the NFL schedule from ESPN
    const url = `${BASE_URL}/scoreboard`;
    console.log('Fetching URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      return NextResponse.json(
        { error: 'Failed to fetch NFL schedule' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data || !data.events) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid API response structure');
    }

    // Transform ESPN data structure to match your existing format
    const games = data.events.map((event: any) => {
      const homeTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'home');
      const awayTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'away');
      
      return {
        id: event.id,
        homeTeam: homeTeam.team.name,
        awayTeam: awayTeam.team.name,
        date: new Date(event.date).toISOString(),
        time: new Date(event.date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Los_Angeles'
        }),
        status: event.status.type.state,
        homeTeamLogo: homeTeam.team.logo,
        awayTeamLogo: awayTeam.team.logo,
        venue: event.competitions[0].venue?.fullName,
        broadcast: event.competitions[0].broadcasts?.[0]?.names?.[0] || 'TBD',
        week: event.week?.number,
        homeScore: homeTeam.score,
        awayScore: awayTeam.score
      };
    });

    // Sort games by scheduled time
    games.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const weekStart = games.length > 0 ? games[0].date : null;
    const weekEnd = games.length > 0 ? games[games.length - 1].date : null;

    return NextResponse.json({ games, weekStart, weekEnd });

  } catch (error) {
    console.error('Error fetching NFL games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFL schedule', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
