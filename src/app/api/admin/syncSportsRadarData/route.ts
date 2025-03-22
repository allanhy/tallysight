import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getAuth } from '@clerk/nextjs/server';

// Define interfaces for type safety
interface ESPNGame {
  id: string;
  status: {
    type: {
      state: string;
      completed: boolean;
    }
  };
  date: string;
  competitions: Array<{
    id: string;
    competitors: Array<{
      id: string;
      homeAway: string;
      team: {
        displayName: string;
      };
      score: string;
    }>;
  }>;
}

interface DatabaseGame {
  id: string;
  team1Name: string;
  team2Name: string;
  team1Score?: number;
  team2Score?: number;
  winner?: number;
  gameDate: Date;
  espnId?: string;
  // other fields
}

// Add error handling and timeout to the fetch request
const fetchESPNData = async (url: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`ESPN API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from ESPN:', error);
    throw new Error(`Failed to fetch data from ESPN: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Common team name mappings - moved outside both functions
const teamMappings: Record<string, string[]> = {
  'lakers': ['los angeles lakers', 'la lakers'],
  'clippers': ['los angeles clippers', 'la clippers'],
  'warriors': ['golden state warriors', 'golden state'],
  'knicks': ['new york knicks', 'new york'],
  'nets': ['brooklyn nets', 'brooklyn'],
  'celtics': ['boston celtics', 'boston'],
  'bulls': ['chicago bulls', 'chicago'],
  'heat': ['miami heat', 'miami'],
  'bucks': ['milwaukee bucks', 'milwaukee'],
  'magic': ['orlando magic', 'orlando'],
  'pistons': ['detroit pistons', 'detroit'],
  'pacers': ['indiana pacers', 'indiana'],
  'hawks': ['atlanta hawks', 'atlanta'],
  'wizards': ['washington wizards', 'washington'],
  'raptors': ['toronto raptors', 'toronto'],
  'hornets': ['charlotte hornets', 'charlotte'],
  'rockets': ['houston rockets', 'houston'],
  'pelicans': ['new orleans pelicans', 'new orleans'],
  'spurs': ['san antonio spurs', 'san antonio'],
  'mavericks': ['dallas mavericks', 'dallas'],
  'nuggets': ['denver nuggets', 'denver'],
  'timberwolves': ['minnesota timberwolves', 'minnesota'],
  'thunder': ['oklahoma city thunder', 'oklahoma city', 'okc'],
  'trail blazers': ['portland trail blazers', 'portland'],
  'jazz': ['utah jazz', 'utah'],
  'suns': ['phoenix suns', 'phoenix'],
  'kings': ['sacramento kings', 'sacramento'],
  'grizzlies': ['memphis grizzlies', 'memphis'],
  '76ers': ['philadelphia 76ers', 'philadelphia', 'philly'],
  'cavaliers': ['cleveland cavaliers', 'cleveland']
};

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    // Parse request body to get gameIds to sync
    const body = await req.json();
    const { gameIds } = body;
    
    // Fetch games from ESPN API - always get the latest scoreboard
    const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`;
    
    console.log(`Fetching data from ESPN: ${espnUrl}`);
    
    const espnData = await fetchESPNData(espnUrl);
    
    // Filter to only include completed games
    const filteredGames = espnData.events.filter((game: ESPNGame) => {
      // If gameIds are provided, only include games that match those IDs
      if (gameIds && gameIds.length > 0) {
        return gameIds.includes(game.id) && game.status.type.completed === true;
      }
      // Otherwise include all completed games
      return game.status.type.completed === true;
    });
    
    console.log(`Retrieved ${espnData.events.length} games from ESPN, ${filteredGames.length} completed/matching games`);
    
    // Get all games from the database
    const allGames = await sql<DatabaseGame>`
      SELECT * FROM "Game" 
      ORDER BY "gameDate" DESC
      LIMIT 200
    `;
    
    console.log(`Found ${allGames.rows.length} recent games in database`);
    
    // Check if there are any games with these specific teams
    const teamExamples = ['Chicago', 'Miami', 'Lakers', 'Boston', 'Orlando', 'Milwaukee'];
    console.log("Searching for specific teams in database:");
    teamExamples.forEach(team => {
      const matches = allGames.rows.filter(g => 
        g.team1Name.toLowerCase().includes(team.toLowerCase()) || 
        g.team2Name.toLowerCase().includes(team.toLowerCase())
      );
      console.log(`Found ${matches.length} games with "${team}" in team names`);
      if (matches.length > 0) {
        matches.slice(0, 3).forEach(g => {
          console.log(`  Match: "${g.team1Name}" vs "${g.team2Name}", Date: ${g.gameDate}`);
        });
      }
    });
    
    // Process each completed game from ESPN
    const updateResults = await Promise.all(filteredGames.map(async (espnGame: ESPNGame) => {
      const competition = espnGame.competitions[0];
      const homeTeam = competition.competitors.find(c => c.homeAway === 'home')?.team.displayName;
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away')?.team.displayName;
      const gameDate = new Date(espnGame.date);
      const dateStr = gameDate.toISOString().split('T')[0];
      
      console.log(`Processing completed game: ${awayTeam} @ ${homeTeam} on ${dateStr}, ESPN ID: ${espnGame.id}`);
      
      // Improved team name normalization function
      const normalizeTeamName = (name: string) => {
        if (!name) return '';
        
        // Normalize the name
        const normalized = name.toLowerCase()
          .replace(/^the /, '')  // Remove leading "The"
          .trim();
        
        // Return the normalized name
        return normalized;
      };
      
      // Check if two team names match
      const teamsMatch = (name1: string, name2: string) => {
        const norm1 = normalizeTeamName(name1);
        const norm2 = normalizeTeamName(name2);
        
        // Direct match
        if (norm1 === norm2) return true;
        
        // Check if one contains the other
        if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
        
        // Check common variations
        for (const [key, variations] of Object.entries(teamMappings)) {
          if ((norm1.includes(key) || variations.some(v => norm1.includes(v))) && 
              (norm2.includes(key) || variations.some(v => norm2.includes(v)))) {
            return true;
          }
        }
        
        return false;
      };
      
      // Normalize ESPN team names
      const normHomeTeam = normalizeTeamName(homeTeam || '');
      const normAwayTeam = normalizeTeamName(awayTeam || '');
      
      console.log(`Normalized team names: "${normAwayTeam}" @ "${normHomeTeam}"`);
      
      // First try to find by direct ID match if your DB has ESPN IDs
      let dbGame = allGames.rows.find(g => g.espnId === espnGame.id);
      
      // If not found by ID, fall back to team name matching
      if (!dbGame) {
        dbGame = allGames.rows.find(g => {
          // Safely handle potentially undefined values
          const team1 = (g?.team1Name || '').trim();
          const team2 = (g?.team2Name || '').trim();
          
          // Skip empty team names
          if (!team1 || !team2) return false;
          
          // Check if teams match in either order
          const teamsMatchCorrectOrder = teamsMatch(team1, homeTeam || '') && teamsMatch(team2, awayTeam || '');
          const teamsMatchReversedOrder = teamsMatch(team1, awayTeam || '') && teamsMatch(team2, homeTeam || '');
          
          // If we're looking for specific game IDs, we should be more lenient with matching
          // and not require dates to be close
          const isMatch = teamsMatchCorrectOrder || teamsMatchReversedOrder;
          
          if (isMatch) {
            console.log(`Found matching game in DB: ${team1} vs ${team2}, ID: ${g.id}`);
            
            // Log the dates for debugging but don't use them for matching
            const dbDate = new Date(g.gameDate);
            const espnDate = new Date(espnGame.date);
            console.log(`Date info (not used for matching): DB date=${dbDate.toISOString()}, ESPN date=${espnDate.toISOString()}`);
            
            // Return true based on team name matching only
            return isMatch;
          }
          
          return false;
        });
      }
      
      if (!dbGame) {
        console.log(`No matching game found for ${awayTeam} @ ${homeTeam} on ${dateStr}`);
        return {
          espnId: espnGame.id,
          status: 'not_found',
          message: `No matching game found for ${awayTeam} @ ${homeTeam} on ${dateStr}`
        };
      }
      
      // Extract scores
      const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
      const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');
      
      const homeScore = homeCompetitor ? parseInt(homeCompetitor.score) : undefined;
      const awayScore = awayCompetitor ? parseInt(awayCompetitor.score) : undefined;
      
      // Validate scores are present
      if (homeScore === undefined || awayScore === undefined || isNaN(homeScore) || isNaN(awayScore)) {
        return {
          id: dbGame.id,
          espnId: espnGame.id,
          status: 'invalid_data',
          message: 'Game scores are missing or invalid'
        };
      }
      
      // Determine which team won based on our database structure
      // We need to figure out if team1 or team2 in our database corresponds to home or away in ESPN
      const team1IsHome = teamsMatch(dbGame.team1Name, homeTeam || '');
      
      // If team1 is home, then winner is true when away team wins (team2)
      // If team1 is away, then winner is true when home team wins (team2)
      const winnerBoolean = team1IsHome ? (awayScore > homeScore) : (homeScore > awayScore);
      
      // Ensure final score is in the correct order (team1Score-team2Score)
      const team1Score = team1IsHome ? homeScore : awayScore;
      const team2Score = team1IsHome ? awayScore : homeScore;
      const finalScoreStr = `${team1Score}-${team2Score}`;
      
      console.log(`Updating game ${dbGame.id}: ${dbGame.team1Name} vs ${dbGame.team2Name}`);
      console.log(`Team1 is ${team1IsHome ? 'home' : 'away'}, scores: ${team1Score}-${team2Score}`);
      console.log(`Setting winner to ${winnerBoolean} (true=team2 won, false=team1 won)`);
      
      // Try with explicit transaction
      await sql`BEGIN`;
      try {
        const updateResult = await sql`
          UPDATE "Game"
          SET 
            "winner" = ${winnerBoolean},
            "won" = ${Number(winnerBoolean)},
            "final_score" = ${finalScoreStr}
          WHERE "id" = ${dbGame.id}
        `;
        
        await sql`COMMIT`;
        
        console.log(`Database update result: ${updateResult.rowCount} rows affected`);
        
        // Check after commit
        const checkResult = await sql`
          SELECT id, "team1Name", "team2Name", winner, won, final_score
          FROM "Game"
          WHERE "id" = ${dbGame.id}
        `;
        
        console.log(`Direct check of game ${dbGame.id} after update:`);
        if (checkResult.rows.length > 0) {
          const game = checkResult.rows[0];
          console.log(`Current DB state: winner=${game.winner}, won=${game.won}, final_score=${game.final_score}`);
        }
        
        return {
          id: dbGame.id,
          espnId: espnGame.id,
          status: 'updated',
          message: `Updated game with score ${team1Score}-${team2Score}, winner: ${winnerBoolean}`
        };
      } catch (dbError) {
        await sql`ROLLBACK`;
        throw dbError;
      }
    }));
    
    return NextResponse.json({ 
      success: true, 
      results: updateResults 
    });
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}