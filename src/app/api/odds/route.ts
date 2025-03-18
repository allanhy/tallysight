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
  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId');
  const requestedHomeTeam = url.searchParams.get('requestedHomeTeam') || url.searchParams.get('homeTeam');
  const requestedAwayTeam = url.searchParams.get('requestedAwayTeam') || url.searchParams.get('awayTeam');
  
  console.log('API Request params:', { 
    gameId, 
    requestedHomeTeam, 
    requestedAwayTeam 
  });
  
  try {
    const result = await handleSpecificGameRequest(gameId, requestedHomeTeam, requestedAwayTeam);
    
    // Log the response before returning it
    const responseData = await result.json();
    console.log('API Response data:', JSON.stringify(responseData, null, 2));
    
    // Return a new response with the same data
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Function to handle specific game requests (for the preview dialog)
async function handleSpecificGameRequest(gameId: string | null, requestedHomeTeam: string | null, requestedAwayTeam: string | null) {
  try {
    console.log('API Request params:', { gameId, requestedHomeTeam, requestedAwayTeam });
    
    const API_KEY = process.env.ODDS_API_KEY;
    
    // First try the Odds API
    try {
      const oddsResponse = await fetch(
        `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${API_KEY}&regions=us&markets=spreads&oddsFormat=american&bookmakers=fanduel`,
        { cache: 'no-store' }
      );

      if (oddsResponse.ok) {
        const rawData = await oddsResponse.json();
        
        // Find the matching game
        let matchedGame = null;
        
        // Find game by matching team names
        matchedGame = rawData.find((game: any) => {
          const homeTeam = game.home_team;
          const awayTeam = game.away_team;
          
          return (
            (homeTeam.includes(requestedHomeTeam) || requestedHomeTeam?.includes(homeTeam)) &&
            (awayTeam.includes(requestedAwayTeam) || requestedAwayTeam?.includes(awayTeam))
          );
        });
        
        // If you successfully find and process a game, return it
        if (matchedGame) {
          // Also fetch ESPN data for additional details
          const espnResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
          let venue = "";
          let broadcast = "";
          
          if (espnResponse.ok) {
            const espnData = await espnResponse.json();
            const espnGame = espnData.events?.find((event: any) => {
              const competition = event.competitions[0];
              const homeTeam = competition.competitors.find((team: any) => team.homeAway === 'home')?.team.displayName;
              const awayTeam = competition.competitors.find((team: any) => team.homeAway === 'away')?.team.displayName;
              
              return (
                homeTeam === matchedGame.home_team ||
                awayTeam === matchedGame.away_team
              );
            });
            
            if (espnGame && espnGame.competitions?.[0]) {
              const competition = espnGame.competitions[0];
              
              venue = competition.venue?.fullName || '';
              
              if (competition.broadcasts && competition.broadcasts.length > 0) {
                if (Array.isArray(competition.broadcasts[0].names)) {
                  broadcast = competition.broadcasts[0].names.join(', ');
                } else if (competition.broadcasts[0].shortName) {
                  broadcast = competition.broadcasts[0].shortName;
                }
              }
            }
          }
          
          const bookmaker = matchedGame.bookmakers[0];
          const spreadsMarket = bookmaker?.markets.find((market: any) => market.key === 'spreads');
          
          const homeOutcome = spreadsMarket?.outcomes.find((outcome: any) => 
            outcome.name.toLowerCase() === matchedGame.home_team.toLowerCase());
          const awayOutcome = spreadsMarket?.outcomes.find((outcome: any) => 
            outcome.name.toLowerCase() === matchedGame.away_team.toLowerCase());
          
          const formatSpread = (spread: number | undefined): string => {
            if (spread === undefined) return '';
            // Always show the sign (+ or -) and format to one decimal place if needed
            const spreadValue = spread % 1 === 0 ? spread : parseFloat(spread.toFixed(1));
            // Just return the spread value with appropriate sign, without the favorite/underdog text
            return spreadValue > 0 ? `+${spreadValue}` : `${spreadValue}`;
          };
          
          // Log the spread data for debugging
          console.log('Spread data:', {
            homeTeam: matchedGame.home_team,
            awayTeam: matchedGame.away_team,
            homePoint: homeOutcome?.point,
            awayPoint: awayOutcome?.point,
            homeSpread: formatSpread(homeOutcome?.point),
            awaySpread: formatSpread(awayOutcome?.point)
          });
          
          // Create the game object with the spread data
          const game = {
            id: matchedGame.id,
            homeTeam: {
              name: matchedGame.home_team,
              spread: formatSpread(homeOutcome?.point),
              logo: NBA_TEAM_LOGOS[matchedGame.home_team] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
              record: ""
            },
            awayTeam: {
              name: matchedGame.away_team,
              spread: formatSpread(awayOutcome?.point),
              logo: NBA_TEAM_LOGOS[matchedGame.away_team] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
              record: ""
            },
            gameTime: matchedGame.commence_time ? new Date(matchedGame.commence_time * 1000).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            }) + ' ET' : matchedGame.commence_time,
            status: "Scheduled",
            venue: venue,
            broadcast: broadcast
          };
          
          console.log('API Response data:', { games: [game] });
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
      // Fetch both today's and tomorrow's scoreboard data
      const todayResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrowDateStr = tomorrowDate.toISOString().split('T')[0];
      const tomorrowResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${tomorrowDateStr}`);
      
      let espnData: { events: any[] } = { events: [] };
      
      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        espnData.events = [...espnData.events, ...todayData.events];
      }
      
      if (tomorrowResponse.ok) {
        const tomorrowData = await tomorrowResponse.json();
        espnData.events = [...espnData.events, ...tomorrowData.events];
      }
      
      // Find the matching game in combined ESPN data
      const espnGame = espnData.events.find((event: any) => {
        // Match by team names
        const homeTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'home')?.team.displayName;
        const awayTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'away')?.team.displayName;
        
        // Check for team name variations (e.g., "LA Clippers" vs "Los Angeles Clippers")
        const homeTeamMatches = homeTeam && requestedHomeTeam && 
                               (homeTeam.includes(requestedHomeTeam) || requestedHomeTeam.includes(homeTeam));
        const awayTeamMatches = awayTeam && requestedAwayTeam && 
                               (awayTeam.includes(requestedAwayTeam) || requestedAwayTeam.includes(awayTeam));
        
        return homeTeamMatches && awayTeamMatches;
      });

      if (espnGame) {
        const competition = (espnGame as any).competitions?.[0];
        if (competition) {
          const homeTeamData = competition.competitors?.find((team: any) => team.homeAway === 'home');
          const awayTeamData = competition.competitors?.find((team: any) => team.homeAway === 'away');
          
          // Extract venue and broadcast information
          const venue = competition.venue?.fullName || '';
          
          // Handle different broadcast formats
          let broadcasts = '';
          if (competition.broadcasts && competition.broadcasts.length > 0) {
            if (Array.isArray(competition.broadcasts[0].names)) {
              broadcasts = competition.broadcasts[0].names.join(', ');
            } else if (competition.broadcasts[0].shortName) {
              broadcasts = competition.broadcasts[0].shortName;
            }
          }
          
          // Process the game data here...
          // (You'll need to add the actual processing code here)
          
          // Create and return the game object with ESPN data
          const game = {
            id: gameId || espnGame.id,
            homeTeam: {
              name: homeTeamData?.team?.displayName || requestedHomeTeam,
              spread: "", // No spread from ESPN
              logo: NBA_TEAM_LOGOS[homeTeamData?.team?.displayName] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
              record: homeTeamData?.records?.[0]?.summary || ""
            },
            awayTeam: {
              name: awayTeamData?.team?.displayName || requestedAwayTeam,
              spread: "", // No spread from ESPN
              logo: NBA_TEAM_LOGOS[awayTeamData?.team?.displayName] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
              record: awayTeamData?.records?.[0]?.summary || ""
            },
            gameTime: new Date(espnGame.date).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            }) + ' ET',
            status: espnGame.status?.type?.name || "Scheduled",
            venue: venue,
            broadcast: broadcasts
          };
          
          return NextResponse.json({ games: [game] });
        }
      }

      // If no ESPN game was found, return an error
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    } catch (espnError) {
      console.error('Error fetching ESPN data:', espnError);
    }
    
    // If both APIs fail, return a basic response with dummy spreads
    return NextResponse.json({ 
      games: [{
        id: gameId || "unknown",
        homeTeam: {
          name: requestedHomeTeam || "Home Team",
          record: "",
          logo: NBA_TEAM_LOGOS[requestedHomeTeam || ""] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
          spread: "-3.5"  // Default home team is usually favored by 3-4 points
        },
        awayTeam: {
          name: requestedAwayTeam || "Away Team",
          record: "",
          logo: NBA_TEAM_LOGOS[requestedAwayTeam || ""] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
          spread: "+3.5"  // Default away team is usually underdog by 3-4 points
        },
        gameTime: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }) + ' ET',
        status: "Scheduled",
        venue: "TBD",
        broadcast: "TBD",
        date: new Date().toLocaleDateString(),
        note: "Using estimated spreads"
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

// Handle NBA odds request
async function handleNFLOddsRequest() {
  try {
    const API_KEY = process.env.ODDS_API_KEY;
    
    // Check if API key exists
    if (!API_KEY) {
      console.error('Missing ODDS_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error', message: 'Missing API key' },
        { status: 500 }
      );
    }

    try {
      const [oddsResponse, espnResponse] = await Promise.all([
        fetch(
          `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${API_KEY}&regions=us&markets=spreads&oddsFormat=american&bookmakers=fanduel`,
          { cache: 'no-store' }
        ),
        fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard')
      ]);

      // If Odds API fails, fall back to ESPN data only
      if (!oddsResponse.ok) {
        console.warn(`Odds API responded with status: ${oddsResponse.status}`);
        
        // Process ESPN data only
        if (espnResponse.ok) {
          const espnData = await espnResponse.json();
          // Format ESPN data without odds information
          // ... (implement fallback logic here)
          return NextResponse.json({ 
            games: [], // Populate with ESPN data
            note: "Odds API unavailable - showing ESPN data only" 
          });
        } else {
          throw new Error('Both Odds API and ESPN API failed');
        }
      }

      // Continue with normal processing if both APIs succeed
      const rawData = await oddsResponse.json();
      const espnData = await espnResponse.json();
      
      // Get current date
      const now = new Date();
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

          // Get team records from ESPN data
          const homeTeamData = competition?.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeamData = competition?.competitors.find((c: any) => c.homeAway === 'away');
          const homeRecord = homeTeamData?.records?.[0]?.summary || '';
          const awayRecord = awayTeamData?.records?.[0]?.summary || '';

          return {
            id: game.id,
            date: formatGameTime(game.commence_time),
            team1: {
              name: homeTeam,
              record: homeRecord,
              spread: formatSpread(homeOutcome?.point),
              logo: NBA_TEAM_LOGOS[homeTeam] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
              win: "50.0%"
            },
            team2: {
              name: awayTeam,
              record: awayRecord,
              spread: formatSpread(awayOutcome?.point),
              logo: NBA_TEAM_LOGOS[awayTeam] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
              win: "50.0%"
            },
            week: 1,
            venue: venueString,
            broadcast: broadcastString,
            status: "scheduled",
            isAvailable: new Date(game.commence_time) > now
          };
        });

      return NextResponse.json({ games });
    } catch (error) {
      console.error('Error in NBA odds API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch NBA odds data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in NBA odds API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NBA odds data' },
      { status: 500 }
    );
  }
} 