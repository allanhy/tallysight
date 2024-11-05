import { NextResponse } from 'next/server';

const SPORTRADAR_API_KEY = process.env.SPORTRADAR_API_KEY;
const BASE_URL = 'http://api.sportradar.us/nfl/official/trial/v7/en';

const getTeamLogo = (teamName: string) => {
  // Strip any city names and get just the team name
  const teamNameOnly = teamName.split(' ').pop() || '';
  
  const teamIds: { [key: string]: string } = {
    'Cardinals': '22',
    'Falcons': '1',
    'Ravens': '33',
    'Bills': '2',
    'Panthers': '29',
    'Bears': '3',
    'Bengals': '4',
    'Browns': '5',
    'Cowboys': '6',
    'Broncos': '7',
    'Lions': '8',
    'Packers': '9',
    'Texans': '34',
    'Colts': '11',
    'Jaguars': '30',
    'Chiefs': '12',
    'Raiders': '13',
    'Chargers': '24',
    'Rams': '14',
    'Dolphins': '15',
    'Vikings': '16',
    'Patriots': '17',
    'Saints': '18',
    'Giants': '19',
    'Jets': '20',
    'Eagles': '21',
    'Steelers': '23',
    '49ers': '25',
    'Seahawks': '26',
    'Buccaneers': '27',
    'Titans': '10',
    'Commanders': '28'
  };

  // Add console.log to debug
  console.log('Team Name:', teamName);
  console.log('Team ID:', teamIds[teamNameOnly]);
  
  const teamId = teamIds[teamNameOnly];
  if (!teamId) {
    console.log('No team ID found for:', teamName);
    return null;
  }
  
  const logoUrl = `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId}.png`;
  console.log('Logo URL:', logoUrl);
  return logoUrl;
};

export async function GET() {
  try {
    // Get current year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Fetch the NFL schedule
    const response = await fetch(
      `${BASE_URL}/games/${currentYear}/REG/schedule.json?api_key=${SPORTRADAR_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch NFL schedule');
    }

    const data = await response.json();

    // Find the most relevant week
    let relevantWeek = data.weeks.reduce((closest: any, week: any) => {
      if (!week.games || week.games.length === 0) return closest;
      
      const weekStart = new Date(week.games[0].scheduled);
      const weekEnd = new Date(week.games[week.games.length - 1].scheduled);
      
      // If current date is within this week, return this week
      if (currentDate >= weekStart && currentDate <= weekEnd) {
        return week;
      }
      
      // If we haven't found a week yet, or if this week is closer to current date
      if (!closest || Math.abs(currentDate.getTime() - weekStart.getTime()) < 
          Math.abs(currentDate.getTime() - new Date(closest.games[0].scheduled).getTime())) {
        return week;
      }
      
      return closest;
    }, null);

    // If still no week found, get the first upcoming week
    if (!relevantWeek) {
      relevantWeek = data.weeks.find((week: any) => {
        if (!week.games || week.games.length === 0) return false;
        const weekStart = new Date(week.games[0].scheduled);
        return weekStart >= currentDate;
      });
    }

    // If still no week found, get the last played week
    if (!relevantWeek) {
      relevantWeek = data.weeks[data.weeks.length - 1];
    }

    // Transform the games data
    const games = relevantWeek.games.map((game: any) => ({
      id: game.id,
      homeTeam: game.home.name,
      awayTeam: game.away.name,
      date: new Date(game.scheduled).toISOString(),
      time: new Date(game.scheduled).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
      }),
      status: game.status,
      homeTeamLogo: getTeamLogo(game.home.name),
      awayTeamLogo: getTeamLogo(game.away.name),
      venue: game.venue?.name,
      broadcast: game.broadcast?.network || 'TBD',
      week: relevantWeek.sequence,
      homeScore: game.home_points,
      awayScore: game.away_points
    }));

    // Sort games by scheduled time
    games.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ games });

  } catch (error) {
    console.error('Error fetching NFL games:', error);
    
    // Return mock data if API fails
    const mockGames = [
      {
        id: '1',
        homeTeam: 'Eagles',
        awayTeam: 'Cowboys',
        date: new Date().toISOString(),
        time: '1:00 PM',
        status: 'Scheduled',
        homeTeamLogo: getTeamLogo('Eagles'),
        awayTeamLogo: getTeamLogo('Cowboys'),
        week: 1
      },
      // Add more mock games if needed
    ];

    return NextResponse.json({ games: mockGames });
  }
} 