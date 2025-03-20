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

// Add this mapping of team nicknames to full names
const TEAM_NAME_MAPPING: { [key: string]: string } = {
  'kings': 'sacramento kings',
  'cavaliers': 'cleveland cavaliers',
  'cavs': 'cleveland cavaliers',
  'blazers': 'portland trail blazers',
  'sixers': 'philadelphia 76ers',
  'knicks': 'new york knicks',
  'mavs': 'dallas mavericks',
  'wolves': 'minnesota timberwolves',
  'lakers': 'los angeles lakers',
  'celtics': 'boston celtics',
  'nets': 'brooklyn nets',
  'heat': 'miami heat',
  'bucks': 'milwaukee bucks',
  'suns': 'phoenix suns',
  'grizzlies': 'memphis grizzlies',
  'warriors': 'golden state warriors'
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
    
    // Normalize and find full team names first
    const normalizedHomeTeam = requestedHomeTeam?.toLowerCase() || '';
    const normalizedAwayTeam = requestedAwayTeam?.toLowerCase() || '';
    
    // Find full team names from our database
    let fullHomeTeamName = requestedHomeTeam || '';
    let fullAwayTeamName = requestedAwayTeam || '';
    
    // Try to match with NBA_TEAM_LOGOS keys
    for (const teamName of Object.keys(NBA_TEAM_LOGOS)) {
      if (teamName.toLowerCase().includes(normalizedHomeTeam) || 
          normalizedHomeTeam.includes(teamName.toLowerCase())) {
        fullHomeTeamName = teamName;
      }
      if (teamName.toLowerCase().includes(normalizedAwayTeam) || 
          normalizedAwayTeam.includes(teamName.toLowerCase())) {
        fullAwayTeamName = teamName;
      }
    }
    
    // Also check TEAM_NAME_MAPPING
    for (const [nickname, fullName] of Object.entries(TEAM_NAME_MAPPING)) {
      if (normalizedHomeTeam.includes(nickname)) {
        // Find the matching full team name in NBA_TEAM_LOGOS
        for (const teamName of Object.keys(NBA_TEAM_LOGOS)) {
          if (teamName.toLowerCase().includes(fullName)) {
            fullHomeTeamName = teamName;
          }
        }
      }
      if (normalizedAwayTeam.includes(nickname)) {
        // Find the matching full team name in NBA_TEAM_LOGOS
        for (const teamName of Object.keys(NBA_TEAM_LOGOS)) {
          if (teamName.toLowerCase().includes(fullName)) {
            fullAwayTeamName = teamName;
          }
        }
      }
    }
    
    console.log('Resolved team names:', { fullHomeTeamName, fullAwayTeamName });
    
    // Try to find the game in ESPN data
    let foundGame = null;
    let venue = '';
    let broadcast = '';
    let homeRecord = '';
    let awayRecord = '';
    let gameTime = '7:00 PM ET'; // Default
    let status = 'Scheduled';
    
    try {
      // First try to fetch the specific game by ID
      if (gameId) {
        const specificGameResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard/events/${gameId}`);
        if (specificGameResponse.ok) {
          const specificGameData = await specificGameResponse.json();
          console.log('Found specific game by ID:', specificGameData);
          foundGame = specificGameData;
        }
      }
      
      // If no game found by ID, fetch games for multiple days
      if (!foundGame) {
        console.log('Fetching games for multiple days');
        
        // Get today's date
        const today = new Date();
        
        // Fetch data for today and the next 3 days
        for (let i = 0; i < 4; i++) {
          if (foundGame) break; // Stop if we found a game
          
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          // Format date as YYYYMMDD for ESPN API
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateStr = `${year}${month}${day}`;
          
          console.log(`Fetching games for date: ${year}-${month}-${day}`);
          
          const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`Found ${data.events?.length || 0} games for ${year}-${month}-${day}`);
            
            // Look for matching game
            const matchingGame = data.events?.find((event: any) => {
              const competition = event.competitions[0];
              const homeTeam = competition.competitors.find((team: any) => team.homeAway === 'home')?.team.displayName;
              const awayTeam = competition.competitors.find((team: any) => team.homeAway === 'away')?.team.displayName;
              
              return (
                (homeTeam.toLowerCase().includes(normalizedHomeTeam) || 
                 normalizedHomeTeam.includes(homeTeam.toLowerCase())) &&
                (awayTeam.toLowerCase().includes(normalizedAwayTeam) || 
                 normalizedAwayTeam.includes(awayTeam.toLowerCase()))
              );
            });
            
            if (matchingGame) {
              console.log('Found matching game:', matchingGame.id);
              foundGame = matchingGame;
              break;
            }
          }
        }
      }
      
      // Extract game details if found
      if (foundGame) {
        const competition = foundGame.competitions?.[0];
        if (competition) {
          const homeTeamData = competition.competitors?.find((team: any) => team.homeAway === 'home');
          const awayTeamData = competition.competitors?.find((team: any) => team.homeAway === 'away');
          
          // Update team names if available
          if (homeTeamData?.team?.displayName) {
            fullHomeTeamName = homeTeamData.team.displayName;
          }
          if (awayTeamData?.team?.displayName) {
            fullAwayTeamName = awayTeamData.team.displayName;
          }
          
          // Extract venue and broadcast information
          venue = competition.venue?.fullName || 'TBD';
          
          // Handle different broadcast formats
          if (competition.broadcasts && competition.broadcasts.length > 0) {
            if (Array.isArray(competition.broadcasts[0].names)) {
              broadcast = competition.broadcasts[0].names.join(', ');
            } else if (competition.broadcasts[0].shortName) {
              broadcast = competition.broadcasts[0].shortName;
            }
          }
          
          // Get team records
          homeRecord = homeTeamData?.records?.[0]?.summary || '';
          awayRecord = awayTeamData?.records?.[0]?.summary || '';
          
          // Format game time
          if (foundGame.date) {
            try {
              const gameDate = new Date(foundGame.date);
              gameTime = gameDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              }) + ' ET';
            } catch (e) {
              console.error('Error formatting game time:', e);
            }
          }
          
          status = foundGame.status?.type?.name || 'Scheduled';
        }
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
    
    // Create response with the best data we have
    const game = {
      id: gameId || `${fullHomeTeamName}-${fullAwayTeamName}`.replace(/\s+/g, '-').toLowerCase(),
      homeTeam: {
        name: fullHomeTeamName,
        record: homeRecord,
        logo: NBA_TEAM_LOGOS[fullHomeTeamName] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
        spread: "-3.5"  // Default spread
      },
      awayTeam: {
        name: fullAwayTeamName,
        record: awayRecord,
        logo: NBA_TEAM_LOGOS[fullAwayTeamName] || 'https://a.espncdn.com/i/teamlogos/nba/500/default.png',
        spread: "+3.5"  // Default spread
      },
      gameTime: gameTime,
      status: status,
      venue: venue,
      broadcast: broadcast
    };
    
    console.log('API Response data:', { games: [game] });
    return NextResponse.json({ games: [game] });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
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