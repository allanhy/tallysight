import { NextResponse } from 'next/server';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

function getTeamLogo(teamName: string): string {
  // Convert team names to their ESPN abbreviations
  const teamAbbreviations: { [key: string]: string } = {
    'Bills': 'buf',
    'Dolphins': 'mia',
    'Patriots': 'ne',
    'Jets': 'nyj',
    'Ravens': 'bal',
    'Bengals': 'cin',
    'Browns': 'cle',
    'Steelers': 'pit',
    'Texans': 'hou',
    'Colts': 'ind',
    'Jaguars': 'jax',
    'Titans': 'ten',
    'Broncos': 'den',
    'Chiefs': 'kc',
    'Raiders': 'lv',
    'Chargers': 'lac',
    'Cowboys': 'dal',
    'Giants': 'nyg',
    'Eagles': 'phi',
    'Commanders': 'wsh',
    'Bears': 'chi',
    'Lions': 'det',
    'Packers': 'gb',
    'Vikings': 'min',
    'Falcons': 'atl',
    'Panthers': 'car',
    'Saints': 'no',
    'Buccaneers': 'tb',
    'Cardinals': 'ari',
    '49ers': 'sf',
    'Seahawks': 'sea',
    'Rams': 'lar'
  };

  const abbreviation = teamAbbreviations[teamName] || teamName.toLowerCase();
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/${abbreviation}.png`;
}

export async function GET() {
  try {
    // Add currentDate definition at the start of the function
    const currentDate = new Date();

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
    
    console.log('ESPN API Response:', data);
    
    // Check if events exists instead of weeks
    if (!data.events || !Array.isArray(data.events)) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json(
        { error: 'Invalid API response structure' },
        { status: 500 }
      );
    }

    const currentWeek = data.week?.number || '0';

    // Transform the games data directly from events
    const games = data.events.map((game: any) => {
      const competition = game.competitions[0];
      return {
        id: competition.id,
        homeTeam: game.competitions[0].competitors.find((t: any) => t.homeAway === 'home')?.team.name,
        awayTeam: game.competitions[0].competitors.find((t: any) => t.homeAway === 'away')?.team.name,
        date: new Date(game.date).toISOString(),
        time: new Date(game.date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/New_York'
        }),
        status: game.status.type.name,
        homeTeamLogo: getTeamLogo(game.competitions[0].competitors.find((t: any) => t.homeAway === 'home')?.team.name),
        awayTeamLogo: getTeamLogo(game.competitions[0].competitors.find((t: any) => t.homeAway === 'away')?.team.name),
        venue: game.competitions[0].venue?.fullName,
        broadcast: game.competitions[0].broadcasts?.[0]?.names?.[0] || 'TBD',
        week: game.week?.number,
        homeScore: game.competitions[0].competitors.find((t: any) => t.homeAway === 'home')?.score,
        awayScore: game.competitions[0].competitors.find((t: any) => t.homeAway === 'away')?.score,
      };
    });

    // Sort games by date
    games.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const weekStart = games.length > 0 ? games[0].date : null;
    const weekEnd = games.length > 0 ? games[games.length - 1].date : null;

    return NextResponse.json({ games, weekStart, weekEnd, week: currentWeek });

  } catch (error) {
    console.error('Error fetching NFL games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFL schedule', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 