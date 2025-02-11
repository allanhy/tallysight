import { NextResponse } from 'next/server';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

export async function GET() {
  try {
    // Get current NFL week data
    const scheduleResponse = await fetch(`${ESPN_API_BASE}/scoreboard`);
    const scheduleData = await scheduleResponse.json();

    // Transform ESPN data to match your Game interface
    const games = scheduleData.events.map((event: any) => {
      const { id, name, date, status, competitions } = event;
      const game = event.competitions[0];
      const [team1, team2] = game.competitors;

      return {
        id: game.id,
        date: new Date(date).toLocaleString(),
        team1: {
          name: team1.team.displayName,
          spread: team1.odds?.spread || '-',
          logo: team1.team.logo,
          record: team1.records?.[0]?.summary || '-'
        },
        team2: {
          name: team2.team.displayName,
          spread: team2.odds?.spread || '-',
          logo: team2.team.logo,
          record: team2.records?.[0]?.summary || '-'
        },
        week: scheduleData.week.number,
        venue: game.venue?.fullName || 'TBD',
        broadcast: game.broadcasts?.[0]?.names?.[0] || 'TBD',
        status: status.type.name,
        isAvailable: status.type.name === 'STATUS_SCHEDULED',
        stats: {
          team1: {
            wins: parseInt(team1.records?.[0]?.summary?.split('-')?.[0] || '0'),
            losses: parseInt(team1.records?.[0]?.summary?.split('-')?.[1] || '0')
          },
          team2: {
            wins: parseInt(team2.records?.[0]?.summary?.split('-')?.[0] || '0'),
            losses: parseInt(team2.records?.[0]?.summary?.split('-')?.[1] || '0')
          }
        }
      };
    });

    return NextResponse.json({ games });

  } catch (error) {
    console.error('ESPN API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ESPN data' }, { status: 500 });
  }
}