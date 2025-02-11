/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

// ESPN CDN URLs for NBA team logos
const NBA_TEAM_LOGOS: { [key: string]: string } = {
  'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
  'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
  'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
  'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
  'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
  'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
  'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
  'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
  'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
  'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
  'Houston Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
  'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
  'LA Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
  'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
  'Memphis Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
  'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
  'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
  'Minnesota Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
  'New Orleans Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
  'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
  'Oklahoma City Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
  'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
  'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
  'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
  'Portland Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
  'Sacramento Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
  'San Antonio Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
  'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
  'Utah Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
  'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png'
};

export async function GET(request: Request) {
  const apiKey = process.env.ODDS_API_KEY;
  const sport = 'basketball_nba';
  
  try {
    const response = await fetch(`https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=spreads`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data into the format your frontend expects
    const games = data.map((game: any) => ({
      id: game.id,
      date: game.commence_time,
      team1: {
        name: game.home_team,
        spread: game.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.point || 'N/A',
        logo: NBA_TEAM_LOGOS[game.home_team] || 'https://a.espncdn.com/i/teamlogos/default-team-logo-500.png'
      },
      team2: {
        name: game.away_team,
        spread: game.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.point || 'N/A',
        logo: NBA_TEAM_LOGOS[game.away_team] || 'https://a.espncdn.com/i/teamlogos/default-team-logo-500.png'
      },
      status: 'scheduled',
      isAvailable: true
    }));

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromWednesday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilTuesday);
    endOfWeek.setHours(23, 59, 59, 999);

    // Calculate week number (NFL week logic could vary)
    const week = Math.ceil((Number(now) - Number(new Date(startOfWeek.getFullYear(), 8, 1))) / (7 * 24 * 60 * 60 * 1000));

    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

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

    const games = rawData
      .filter((game: any) => {
        const gameDate = new Date(game.commence_time);
        return gameDate >= now && gameDate <= oneWeekFromNow;
      })
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    return NextResponse.json({ games, weekStart: startOfWeek.toISOString(), weekEnd: endOfWeek.toISOString(), week,});
  } catch (error) {
    console.error('Error in odds API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch odds', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}