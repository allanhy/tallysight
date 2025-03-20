/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { toZonedTime, format } from 'date-fns-tz';

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

// Add this function to convert UTC dates to Eastern Time
function convertToEasternTime(utcDate: Date) {
  const timeZone = 'America/New_York';
  return toZonedTime(utcDate, timeZone);
}

// Define an interface for the game object
interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: Date;
  time: string;
  status: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  venue: string;
  broadcast: string;
  homeScore: string;
  awayScore: string;
  period: number;
  clock: string;
}

export async function GET() {
  try {
    const url = `${BASE_URL}/scoreboard`;
   //console.log('Fetching URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
     //console.error('API Response Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch NBA schedule' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
   //console.log('Raw API Response:', data);
    
    if (!data.events || !Array.isArray(data.events)) {
     //console.error('No events found in API response');
      return NextResponse.json(
        { error: 'No events found' },
        { status: 500 }
      );
    }

    // Get current date in EST
    const now = new Date();
    const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
   //console.log('Current EST time:', estNow);

    // Transform and filter games
    const games = data.events.map((game: any) => {
      const gameDate = new Date(game.date);
      const competition = game.competitions[0];
      const homeTeamData = competition.competitors.find((t: any) => t.homeAway === 'home')?.team;
      const awayTeamData = competition.competitors.find((t: any) => t.homeAway === 'away')?.team;

     /*console.log('Processing game:', {
        homeTeam: homeTeamData?.name,
        awayTeam: awayTeamData?.name,
        date: gameDate
      });*/

      return {
        id: competition.id,
        homeTeam: homeTeamData?.name || 'Unknown Team',
        awayTeam: awayTeamData?.name || 'Unknown Team',
        date: gameDate,
        time: gameDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/New_York'
        }),
        status: game.status.type.name,
        homeTeamLogo: getTeamLogo(homeTeamData?.name),
        awayTeamLogo: getTeamLogo(awayTeamData?.name),
        venue: competition.venue?.fullName || 'TBD',
        broadcast: competition.broadcasts?.[0]?.names?.[0] || 'TBD',
        homeScore: competition.competitors.find((t: any) => t.homeAway === 'home')?.score || '0',
        awayScore: competition.competitors.find((t: any) => t.homeAway === 'away')?.score || '0',
        period: competition.status?.period || 0,
        clock: competition.status?.displayClock || ''
      };
    })
    
    /*
    
    .filter((game: { date: string }) => {
      // Only include games that are in the future
      return new Date(game.date) >= estNow;
    }).sort((a: { date: string }, b: { date: string }) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    */
    

    console.log('Processed games:', games);

    if (games.length === 0) {
      return NextResponse.json({
        games: [],
        message: "No upcoming games scheduled"
      });
    }

    // Process each game to include proper time information
    const processedGames = games.map((game: Game) => {
      // Convert UTC date to Eastern Time
      const etDate = convertToEasternTime(new Date(game.date));
      
      return {
        ...game,
        date: game.date,
        formattedDate: format(etDate, 'yyyy-MM-dd'),
        formattedTime: format(etDate, 'h:mm a z'), // e.g. "7:30 PM EDT"
        timeZone: 'ET'
      };
    });

    return NextResponse.json({
      games: processedGames,
      gameDay: processedGames[0].date,
      message: `Next available games`
    });

  } catch (error) {
   //console.error('Error in GET function:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NBA schedule', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 