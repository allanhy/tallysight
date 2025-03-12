/* eslint-disable @typescript-eslint/no-explicit-any */
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
    
    console.log('API Request params:', { gameId, requestedHomeTeam, requestedAwayTeam });
    
    // If we have specific game parameters, handle it differently
    if (gameId || requestedHomeTeam || requestedAwayTeam) {
      return handleSpecificGameRequest(gameId, requestedHomeTeam, requestedAwayTeam);
    }
    
    // Otherwise, continue with the original NFL odds functionality
    return handleNFLOddsRequest();
  } catch (error) {
    console.error('Error in odds API:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to handle specific game requests (for the preview dialog)
async function handleSpecificGameRequest(gameId: string | null, requestedHomeTeam: string | null, requestedAwayTeam: string | null) {
  try {
    console.log('API Request params:', { gameId, requestedHomeTeam, requestedAwayTeam });
    
    const API_KEY = process.env.ODDS_API_KEY;
    
    // First try the Odds API as before
    try {
      const oddsResponse = await fetch(
        `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${API_KEY}&regions=us&markets=spreads&oddsFormat=american&bookmakers=fanduel`,
        { cache: 'no-store' }
      );

      if (oddsResponse.ok) {
        const rawData = await oddsResponse.json();
        
        // Find the matching game - declare matchedGame here
        let matchedGame = null;
        
        // Your existing code to find the matching game...
        
        // If you successfully find and process a game, return it
        if (matchedGame) {
          // Define game here before returning it
          const game = {
            // Your game object properties
          };
          
          return NextResponse.json({ games: [game] });
        }
      } else {
        console.log('Odds API limit reached, falling back to ESPN API');
      }
    } catch (oddsError) {
      console.error('Error with Odds API:', oddsError);
    }
    
    // If Odds API fails or doesn't find a match, try ESPN API
    try {
      const espnResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      
      if (espnResponse.ok) {
        const espnData = await espnResponse.json();
        
        // Find matching game by team names
        const matchingGame = espnData.events?.find((event: any) => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home')?.team.displayName;
          const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away')?.team.displayName;
          
          return (
            (homeTeam?.includes(requestedHomeTeam) || requestedHomeTeam?.includes(homeTeam)) &&
            (awayTeam?.includes(requestedAwayTeam) || requestedAwayTeam?.includes(awayTeam))
          );
        });
        
        if (matchingGame) {
          const competition = matchingGame.competitions[0];
          const homeTeamData = competition.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeamData = competition.competitors.find((c: any) => c.homeAway === 'away');
          
          // Format venue string
          const venue = competition.venue;
          const venueString = venue 
            ? `${venue.fullName}${venue.address ? ` - ${venue.address.city}, ${venue.address.state}` : ''}`
            : "TBD";
            
          // Format broadcast string
          const broadcast = competition.broadcasts?.[0];
          const broadcastString = broadcast?.names?.join(', ') || "TBD";
          
          // Get team records
          const homeRecord = homeTeamData.records?.[0]?.summary || '';
          const awayRecord = awayTeamData.records?.[0]?.summary || '';
          
          // Format date
          const date = new Date(matchingGame.date);
          const dateString = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          const timeString = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
          });
          
          return NextResponse.json({
            games: [{
              id: matchingGame.id,
              date: `${dateString} · ${timeString}`,
              team1: {
                name: homeTeamData.team.displayName,
                record: homeRecord,
                logo: homeTeamData.team.logo,
                spread: "N/A" // We don't have spread from ESPN
              },
              team2: {
                name: awayTeamData.team.displayName,
                record: awayRecord,
                logo: awayTeamData.team.logo,
                spread: "N/A" // We don't have spread from ESPN
              },
              venue: venueString,
              broadcast: broadcastString,
              status: matchingGame.status.type.description,
              note: "Odds API limit reached - showing ESPN data only"
            }]
          });
        }
      }
    } catch (espnError) {
      console.error('Error fetching ESPN data:', espnError);
    }
    
    // If both APIs fail, return a basic response
    return NextResponse.json({ 
      games: [{
        id: gameId || "unknown",
        date: "Game information unavailable",
        team1: {
          name: requestedHomeTeam || "Home Team",
          record: "",
          logo: NBA_TEAM_LOGOS[requestedHomeTeam || ""] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
          spread: "N/A"
        },
        team2: {
          name: requestedAwayTeam || "Away Team",
          record: "",
          logo: NBA_TEAM_LOGOS[requestedAwayTeam || ""] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
          spread: "N/A"
        },
        venue: "Information unavailable",
        broadcast: "Information unavailable",
        status: "Scheduled",
        note: "API quota reached - limited information available"
      }]
    });
  } catch (error) {
    console.error('Error in NBA odds API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NBA odds data' },
      { status: 500 }
    );
  }
}

// Original NFL odds functionality
async function handleNFLOddsRequest() {
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

    // Get current date and filter for upcoming week's games
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const daysFromWednesday = (dayOfWeek + 4) % 8; // Days since last Wednesday 
    const daysUntilTuesday = (8 - dayOfWeek) % 7; // Days until next Tuesday

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
    console.error('Error in NFL odds API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFL odds data' },
      { status: 500 }
    );
  }
} 