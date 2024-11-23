import { NextResponse } from 'next/server';

// ESPN CDN URLs for NFL team logos
const NFL_TEAM_LOGOS: { [key: string]: string } = {
  'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',
  'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
  'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
  'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
  'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
  'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
  'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
  'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
  'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
  'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
  'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
  'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
  'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
  'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
  'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
  'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
  'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
  'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
  'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
  'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
  'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
  'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
  'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
  'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
  'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
  'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png'
};

function isGameInCurrentWeek(gameDate: string): boolean {
  const gameTime = new Date(gameDate);
  const now = new Date();
  
  // Get the current week's Tuesday (reset day) at 12:00 AM
  const tuesday = new Date(now);
  tuesday.setDate(now.getDate() - ((now.getDay() + 5) % 7));
  tuesday.setHours(0, 0, 0, 0);
  
  // Get next Tuesday at 12:00 AM
  const nextTuesday = new Date(tuesday);
  nextTuesday.setDate(tuesday.getDate() + 7);
  
  // Check if game is between this Tuesday and next Tuesday
  return gameTime >= tuesday && gameTime < nextTuesday;
}

export async function GET() {
  try {
    const API_KEY = process.env.ODDS_API_KEY;
    const [oddsResponse, espnResponse] = await Promise.all([
      fetch(
        `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${API_KEY}&regions=us&markets=spreads&oddsFormat=american&bookmakers=fanduel`,
        { cache: 'no-store' }
      ),
      fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard')
    ]);

    if (!oddsResponse.ok) {
      throw new Error(`Odds API responded with status: ${oddsResponse.status}`);
    }

    const rawData = await oddsResponse.json();
    const espnData = await espnResponse.json();

    // Filter games to only show current week
    const currentWeekGames = rawData.filter((game: any) => 
      isGameInCurrentWeek(game.commence_time)
    );

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 5) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const week = Math.ceil((now.getTime() - new Date(2023, 8, 5).getTime()) / (7 * 24 * 60 * 60 * 1000));

    const formatSpread = (spread: number | undefined): string => {
      if (!spread) return '0';
      return spread > 0 ? `+${spread}` : spread.toString();
    };

    const formatGameTime = (dateString: string): string => {
      const date = new Date(dateString);
      
      // Format date like "Sun, Nov 19"
      const dayStr = date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      // Format time like "1:00 PM ET"
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        hour12: true
      });

      return `${dayStr} · ${timeStr} ET`;
    };

    const games = currentWeekGames
      .map((game: any) => {
        const homeTeam = game.home_team;
        const awayTeam = game.away_team;
        
        // Find matching ESPN game data
        const espnGame = espnData.events?.find((event: any) => {
          const competition = event.competitions[0];
          return (
            competition.competitors[0].team.displayName === homeTeam ||
            competition.competitors[1].team.displayName === homeTeam
          );
        });
        const espnID = espnGame?.id; // Use ESPN's id for the match

        const competition = espnGame?.competitions[0];
        const venue = competition?.venue;
        const broadcast = competition?.broadcasts?.[0];

        // Format venue string
        const venueString = venue 
          ? `${venue.fullName}${venue.address ? ` - ${venue.address.city}, ${venue.address.state}` : ''}`
          : "TBD";

        // Format broadcast string
        const broadcastString = broadcast?.names?.join(', ') || "TBD";

        const bookmaker = game.bookmakers[0];
        const spreadsMarket = bookmaker?.markets.find((market: any) => market.key === 'spreads');
        
        const homeOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === homeTeam);
        const awayOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === awayTeam);

        return {
          id: game.id,
          date: formatGameTime(game.commence_time),
          team1: {
            name: homeTeam,
            spread: formatSpread(homeOutcome?.point),
            logo: NFL_TEAM_LOGOS[homeTeam] || 'https://a.espncdn.com/i/teamlogos/nfl/500/default.png',
            win: "50.0%"
          },
          team2: {
            name: awayTeam,
            spread: formatSpread(awayOutcome?.point),
            logo: NFL_TEAM_LOGOS[awayTeam] || 'https://a.espncdn.com/i/teamlogos/nfl/500/default.png',
            win: "50.0%"
          },
          week: 1,
          venue: venueString,
          broadcast: broadcastString,
          status: "scheduled",
          isAvailable: new Date(game.commence_time) > now
        };
      });

    return NextResponse.json({ games, weekStart: startOfWeek.toISOString(), weekEnd: endOfWeek.toISOString(), week });
  } catch (error) {
    console.error('Error in odds API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch odds data' },
      { status: 500 }
    );
  }
} 