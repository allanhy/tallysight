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

    if (!oddsResponse.ok) {
      throw new Error(`Odds API responded with status: ${oddsResponse.status}`);
    }

    const rawData = await oddsResponse.json();
    
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
    if (!matchedGame) {
      matchedGame = rawData.find((game: any) => game.bookmakers && game.bookmakers.length > 0);
    }
    
    // If we found a matching game, process it
    if (matchedGame) {
      // Find the best bookmaker (prefer FanDuel)
      const fanduel = matchedGame.bookmakers.find((b: any) => b.key === 'fanduel');
      const draftkings = matchedGame.bookmakers.find((b: any) => b.key === 'draftkings');
      const bookmaker = fanduel || draftkings || matchedGame.bookmakers[0];
      
      if (bookmaker) {
        // Extract markets
        const spreadsMarket = bookmaker.markets.find((market: any) => market.key === 'spreads');
        const h2hMarket = bookmaker.markets.find((market: any) => market.key === 'h2h');
        
        // Find team outcomes
        const homeTeam = matchedGame.home_team;
        const awayTeam = matchedGame.away_team;
        
        const homeSpreadOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === homeTeam);
        const awaySpreadOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === awayTeam);
        const homeH2hOutcome = h2hMarket?.outcomes.find((outcome: any) => outcome.name === homeTeam);
        const awayH2hOutcome = h2hMarket?.outcomes.find((outcome: any) => outcome.name === awayTeam);
        
        // Format the data
        const processedGame = {
          id: matchedGame.id,
          date: formatGameTime(matchedGame.commence_time),
          team1: {
            name: homeTeam,
            spread: homeSpreadOutcome ? formatSpread(homeSpreadOutcome.point) : 'N/A',
            price: homeSpreadOutcome ? formatPrice(homeSpreadOutcome.price) : 'N/A',
            moneyline: homeH2hOutcome ? formatPrice(homeH2hOutcome.price) : 'N/A',
          },
          team2: {
            name: awayTeam,
            spread: awaySpreadOutcome ? formatSpread(awaySpreadOutcome.point) : 'N/A',
            price: awaySpreadOutcome ? formatPrice(awaySpreadOutcome.price) : 'N/A',
            moneyline: awayH2hOutcome ? formatPrice(awayH2hOutcome.price) : 'N/A',
          },
          bookmaker: bookmaker.title
        };
        
        return NextResponse.json({ games: [processedGame] });
      }
    }
    
    // If we couldn't find a matching game or process it, return all games
    const processedGames = rawData.map((game: any) => {
      const bookmaker = game.bookmakers && game.bookmakers.length > 0 ? game.bookmakers[0] : null;
      
      if (!bookmaker) {
        return {
          id: game.id,
          date: formatGameTime(game.commence_time),
          team1: { name: game.home_team, spread: 'N/A', moneyline: 'N/A' },
          team2: { name: game.away_team, spread: 'N/A', moneyline: 'N/A' }
        };
      }
      
      const spreadsMarket = bookmaker.markets.find((market: any) => market.key === 'spreads');
      const h2hMarket = bookmaker.markets.find((market: any) => market.key === 'h2h');
      
      const homeTeam = game.home_team;
      const awayTeam = game.away_team;
      
      const homeSpreadOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === homeTeam);
      const awaySpreadOutcome = spreadsMarket?.outcomes.find((outcome: any) => outcome.name === awayTeam);
      const homeH2hOutcome = h2hMarket?.outcomes.find((outcome: any) => outcome.name === homeTeam);
      const awayH2hOutcome = h2hMarket?.outcomes.find((outcome: any) => outcome.name === awayTeam);
      
      return {
        id: game.id,
        date: formatGameTime(game.commence_time),
        team1: {
          name: homeTeam,
          spread: homeSpreadOutcome ? formatSpread(homeSpreadOutcome.point) : 'N/A',
          price: homeSpreadOutcome ? formatPrice(homeSpreadOutcome.price) : 'N/A',
          moneyline: homeH2hOutcome ? formatPrice(homeH2hOutcome.price) : 'N/A',
        },
        team2: {
          name: awayTeam,
          spread: awaySpreadOutcome ? formatSpread(awaySpreadOutcome.point) : 'N/A',
          price: awaySpreadOutcome ? formatPrice(awaySpreadOutcome.price) : 'N/A',
          moneyline: awayH2hOutcome ? formatPrice(awayH2hOutcome.price) : 'N/A',
        },
        bookmaker: bookmaker.title
      };
    });
    
    return NextResponse.json({ games: processedGames });
  } catch (error) {
    console.error('Error in odds API:', error);
    
    // Return a simple error response
    return NextResponse.json(
      { error: 'Failed to fetch odds data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper functions
function formatSpread(spread: number | undefined): string {
  if (spread === undefined) return 'N/A';
  return spread > 0 ? `+${spread}` : spread.toString();
}

function formatPrice(price: number | undefined): string {
  if (price === undefined) return 'N/A';
  return price > 0 ? `+${price}` : price.toString();
}

function formatGameTime(dateString: string): string {
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
}