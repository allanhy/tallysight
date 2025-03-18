/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dayParam = searchParams.get('day');
        const specificDateParam = searchParams.get('specificDate');

        // Calculate dates
        const now = new Date();
        const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const tomorrow = new Date(estNow);
        tomorrow.setDate(estNow.getDate() + 1);

        // Format dates for API
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        // Declare variables before using them
        let dateStr: string;
        let targetDate: string;
        
        // If a specific date is requested, use that
        if (specificDateParam) {
            // specificDateParam should be in format YYYY-MM-DD
            const [year, month, day] = specificDateParam.split('-').map(Number);
            dateStr = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
            targetDate = specificDateParam;
            console.log(`Using specific date: ${specificDateParam}, formatted as: ${dateStr}`);
        } else {
            // Otherwise use today or tomorrow
            dateStr = dayParam === 'tomorrow' ? formatDate(tomorrow) : formatDate(estNow);
            targetDate = dayParam === 'tomorrow' 
                ? tomorrow.toLocaleDateString('en-CA') 
                : estNow.toLocaleDateString('en-CA');
        }
        
        // Use the calendar endpoint
        const url = `${BASE_URL}/scoreboard?dates=${dateStr}`;
        console.log('Fetching URL:', url);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} for URL: ${url}`);
            return NextResponse.json({
                games: [],
                message: `No games found for ${dayParam || 'today'}`
            });
        }

        const data = await response.json();
        
        if (!data.events || data.events.length === 0) {
            return NextResponse.json({
                games: [],
                message: `No games scheduled for ${dayParam || 'today'}`
            });
        }

        const games = data.events
            .map((game: any) => {
                try {
                    const competition = game.competitions[0];
                    const homeTeam = competition.competitors.find((t: any) => t.homeAway === 'home')?.team;
                    const awayTeam = competition.competitors.find((t: any) => t.homeAway === 'away')?.team;
                    
                    // Get the full date string in ISO format
                    const gameDate = game.date;
                    
                    // Convert UTC date to EST for display
                    const utcDate = new Date(gameDate);
                    
                    // Add debug logging to see the original times
                    console.log(`Game ${homeTeam?.name} vs ${awayTeam?.name} - Original UTC time: ${utcDate.toISOString()}`);
                    
                    // Format the time for display in EST
                    const displayTime = utcDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'America/New_York'
                    });
                    
                    console.log(`Converted to EST display time: ${displayTime}`);
                    
                    // Get the EST date string for proper date grouping
                    const estDateString = utcDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        timeZone: 'America/New_York'
                    });

                    // Format date for database (YYYY-MM-DD)
                    const dbDateFormat = utcDate.toLocaleDateString('en-CA', {
                        timeZone: 'America/New_York'
                    });
                    
                    // Format time for database (HH:MM:SS)
                    const dbTimeFormat = utcDate.toLocaleTimeString('en-US', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZone: 'America/New_York'
                    });

                    // OVERRIDE: Force all games to be on target date but keep original times
                    const forcedDate = new Date(targetDate);
                    
                    // Extract the original time components
                    const originalTime = dbTimeFormat;
                    const [hours, minutes, seconds] = originalTime.split(':').map(Number);
                    
                    // Set the time on our forced date
                    forcedDate.setHours(hours, minutes, seconds);
                    
                    // Format for display with the original time
                    const forcedDisplayTime = forcedDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });
                    
                    console.log(`Forced date with original time: ${forcedDate.toISOString()}, display time: ${forcedDisplayTime}`);
                    
                    const forcedDateString = forcedDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    
                    const forcedDbDate = targetDate;
                    const forcedDbTime = originalTime;

                    // Add debug logging to see what's being saved
                    console.log(`Game ${homeTeam?.name} vs ${awayTeam?.name} - Saving with dbTime: ${forcedDbTime}`);

                    return {
                        id: game.id,
                        homeTeam: {
                            name: homeTeam?.name || 'TBD',
                            score: '0',
                            spread: 'TBD',
                            logo: getTeamLogo(homeTeam?.name)
                        },
                        awayTeam: {
                            name: awayTeam?.name || 'TBD',
                            score: '0',
                            spread: 'TBD',
                            logo: getTeamLogo(awayTeam?.name)
                        },
                        gameTime: forcedDisplayTime, // This should now have the correct original time
                        fullDate: gameDate, // Original ISO date string
                        estDate: forcedDateString, // Forced to target date
                        dbDate: forcedDbDate, // Forced to target date
                        dbTime: forcedDbTime, // Original time preserved
                        status: 'scheduled',
                        forcedDate: true // Flag to indicate date was forced
                    };
                } catch (e) {
                    console.error('Error processing game:', e);
                    return null;
                }
            })
            .filter(Boolean);

        console.log(`Found ${games.length} games for date: ${dateStr}`);

        return NextResponse.json({
            games,
            message: games.length > 0 
                ? `Games retrieved successfully for ${dayParam || 'today'}`
                : `No games scheduled for ${dayParam || 'today'}`
        });

    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json({
            games: [],
            message: 'Error fetching games'
        });
    }
}