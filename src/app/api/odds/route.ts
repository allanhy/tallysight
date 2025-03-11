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
  'Los Angeles Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
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
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const requestedHomeTeam = searchParams.get('homeTeam');
    const requestedAwayTeam = searchParams.get('awayTeam');
    
    // Use the API key from your .env file
    const API_KEY = process.env.ODDS_API_KEY;
    
    // Fetch real odds data from the odds API
    const oddsResponse = await fetch(
      `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${API_KEY}&regions=us&markets=spreads,h2h`,
      { cache: 'no-store' }
    );

    // Also fetch ESPN data for additional game details
    const espnResponse = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      { cache: 'no-store' }
    );

    if (!oddsResponse.ok) {
      throw new Error(`Odds API responded with status: ${oddsResponse.status}`);
    }

    const rawData = await oddsResponse.json();
    const espnData = await espnResponse.json();
    
    // Log the raw data for debugging
    console.log('Raw odds data:', JSON.stringify(rawData).substring(0, 500) + '...');
    
    // Find the matching game - try to match by team names if gameId doesn't match
    let matchedGame = null;
    
    if (gameId) {
      // First try to find by exact gameId
      matchedGame = rawData.find((game: any) => game.id === gameId);
    }
    
    // If no match by ID and we have team names, try to match by team names
    if (!matchedGame && requestedHomeTeam && requestedAwayTeam) {
      matchedGame = rawData.find((game: any) => {
        const homeTeamMatches = game.home_team.toLowerCase().includes(requestedHomeTeam.toLowerCase());
        const awayTeamMatches = game.away_team.toLowerCase().includes(requestedAwayTeam.toLowerCase());
        return homeTeamMatches && awayTeamMatches;
      });
    }
    
    // If still no match, just return the first game with odds
    if (!matchedGame && rawData.length > 0) {
      matchedGame = rawData.find((game: any) => game.bookmakers && game.bookmakers.length > 0);
    }
    
    // If no games with bookmakers, return the first game
    if (!matchedGame && rawData.length > 0) {
      matchedGame = rawData[0];
    }
    
    // Find matching ESPN game for additional details
    let espnGame = null;
    if (matchedGame) {
      espnGame = espnData.events?.find((event: any) => {
        const homeTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team.displayName;
        const awayTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team.displayName;
        
        return (
          homeTeam?.includes(matchedGame.home_team) || 
          matchedGame.home_team.includes(homeTeam) ||
          awayTeam?.includes(matchedGame.away_team) || 
          matchedGame.away_team.includes(awayTeam)
        );
      });
    }
    
    // If we found a matching game, process it
    if (matchedGame) {
      console.log('Matched game:', matchedGame.id, matchedGame.home_team, 'vs', matchedGame.away_team);
      
      // Find the best bookmaker (prefer FanDuel)
      const fanduel = matchedGame.bookmakers.find((b: any) => b.key === 'fanduel');
      const draftkings = matchedGame.bookmakers.find((b: any) => b.key === 'draftkings');
      const bookmaker = fanduel || draftkings || matchedGame.bookmakers[0];
      
      if (bookmaker) {
        console.log('Using bookmaker:', bookmaker.key);
        
        // Extract markets
        const spreadsMarket = bookmaker.markets.find((market: any) => market.key === 'spreads');
        
        // Find team outcomes
        const homeTeam = matchedGame.home_team;
        const awayTeam = matchedGame.away_team;
        
        const homeSpreadOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === homeTeam);
        const awaySpreadOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === awayTeam);
        
        console.log('Spread outcomes:', 
          homeSpreadOutcome ? `${homeTeam}: ${homeSpreadOutcome.point}` : 'No home spread',
          awaySpreadOutcome ? `${awayTeam}: ${awaySpreadOutcome.point}` : 'No away spread'
        );
        
        // Get additional details from ESPN
        let venue = '';
        let broadcast = '';
        let homeRecord = '';
        let awayRecord = '';
        let status = '';
        
        if (espnGame) {
          const competition = espnGame.competitions[0];
          venue = competition.venue?.fullName || '';
          if (competition.venue?.address?.city && competition.venue?.address?.state) {
            venue += ` - ${competition.venue.address.city}, ${competition.venue.address.state}`;
          }
          
          broadcast = competition.broadcasts?.[0]?.names?.join(', ') || '';
          
          const homeTeamData = competition.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeamData = competition.competitors.find((c: any) => c.homeAway === 'away');
          
          homeRecord = homeTeamData?.records?.[0]?.summary || '';
          awayRecord = awayTeamData?.records?.[0]?.summary || '';
          
          status = espnGame.status?.type?.description || '';
        }
        
        // Format the data using ONLY what we get from the API
        const processedGame = {
          id: matchedGame.id,
          date: formatGameTime(matchedGame.commence_time),
          team1: {
            name: homeTeam,
            spread: homeSpreadOutcome ? formatSpread(homeSpreadOutcome.point) : '',
            record: homeRecord
          },
          team2: {
            name: awayTeam,
            spread: awaySpreadOutcome ? formatSpread(awaySpreadOutcome.point) : '',
            record: awayRecord
          },
          venue: venue,
          broadcast: broadcast,
          status: status,
          bookmaker: bookmaker.title
        };
        
        console.log('Processed game:', processedGame);
        return NextResponse.json({ games: [processedGame] });
      } else {
        console.log('No bookmaker found for game');
      }
    } else {
      console.log('No matching game found');
    }
    
    // If we couldn't find a matching game or process it, return an empty response
    return NextResponse.json({ games: [] });
  } catch (error) {
    console.error('Error in odds API:', error);
    
    // Return an empty response in case of error
    return NextResponse.json({ games: [] });
  }
}

// Helper functions
function formatSpread(spread: number | undefined): string {
  if (spread === undefined) return '';
  return spread > 0 ? `+${spread}` : spread.toString();
}

function formatGameTime(dateString: string): string {
  const date = new Date(dateString);
  
  // Format date like "Thu, Nov 28 · 4:30 PM ET"
  const dayStr = date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    hour12: true
  });

  return `${dayStr} · ${timeStr} ET`;
}