import { NextResponse } from 'next/server';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

function getTeamLogo(teamName: string | undefined): string {
  if (!teamName) {
    return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';
  }
  
  const teamAbbreviations: { [key: string]: string } = {
    'Hawks': 'atl',
    'Celtics': 'bos',
    'Nets': 'bkn',
    'Hornets': 'cha',
    'Bulls': 'chi',
    'Cavaliers': 'cle',
    'Mavericks': 'dal',
    'Nuggets': 'den',
    'Pistons': 'det',
    'Warriors': 'gs',
    'Rockets': 'hou',
    'Pacers': 'ind',
    'Clippers': 'lac',
    'Lakers': 'lal',
    'Grizzlies': 'mem',
    'Heat': 'mia',
    'Bucks': 'mil',
    'Timberwolves': 'min',
    'Pelicans': 'no',
    'Knicks': 'ny',
    'Thunder': 'okc',
    'Magic': 'orl',
    '76ers': 'phi',
    'Suns': 'phx',
    'Trail Blazers': 'por',
    'Kings': 'sac',
    'Spurs': 'sa',
    'Raptors': 'tor',
    'Jazz': 'utah',
    'Wizards': 'wsh'
  };

  const abbreviation = teamAbbreviations[teamName] || teamName.toLowerCase();
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${abbreviation}.png`;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dayParam = searchParams.get('day');

        // Calculate dates
        const now = new Date();
        const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const tomorrow = new Date(estNow);
        tomorrow.setDate(estNow.getDate() + 1);

        // Format dates for API
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        const dateStr = dayParam === 'tomorrow' ? formatDate(tomorrow) : formatDate(estNow);
        
        // Use the calendar endpoint
        const url = `${BASE_URL}/scoreboard?dates=${dateStr}`;
        console.log('Fetching URL:', url);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} for URL: ${url}`);
            return NextResponse.json({
                games: [],
                message: `No games found for ${dayParam || 'today'}`
            });
        }

        const data = await response.json();
        console.log('Raw API response:', data); // Debug log

        if (!data.events || data.events.length === 0) {
            return NextResponse.json({
                games: [],
                message: `No games scheduled for ${dayParam || 'today'}`
            });
        }

        const games = data.events
            .map((game: any) => {
                try {
                    const competition = game.competitions[0];
                    const homeTeam = competition.competitors.find((t: any) => t.homeAway === 'home')?.team;
                    const awayTeam = competition.competitors.find((t: any) => t.homeAway === 'away')?.team;

                    return {
                        id: game.id,
                        homeTeam: {
                            name: homeTeam?.name || 'TBD',
                            score: '0',
                            spread: 'TBD',
                            logo: getTeamLogo(homeTeam?.name)
                        },
                        awayTeam: {
                            name: awayTeam?.name || 'TBD',
                            score: '0',
                            spread: 'TBD',
                            logo: getTeamLogo(awayTeam?.name)
                        },
                        gameTime: new Date(game.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'America/New_York'
                        }),
                        status: 'scheduled'
                    };
                } catch (e) {
                    console.error('Error processing game:', e);
                    return null;
                }
            })
            .filter(Boolean);

        console.log(`Found ${games.length} games for date: ${dateStr}`);

        return NextResponse.json({
            games,
            message: games.length > 0 
                ? `Games retrieved successfully for ${dayParam || 'today'}`
                : `No games scheduled for ${dayParam || 'today'}`
        });

    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json({
            games: [],
            message: 'Error fetching games'
        });
    }
}