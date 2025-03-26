interface TeamData {
    abbreviation: string;
    logo: string;
    odds?: string;
}

const BASE_URLS: Record<string, string> = {
    MLB: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb',
    NBA: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba',
    NFL: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
    NHL: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl',
    //Soccer
    MLS: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1', // Major League Soccer
    EPL: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1',   // English Premier League
    LALIGA: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1', // La Liga
    BUNDESLIGA: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1', // Bundesliga
    SERIE_A: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1', // Serie A
    LIGUE_1: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1', // Ligue 1
};

async function fetchOddsData(sport: string, date: string): Promise<Record<string, string>> {
    const baseUrl = BASE_URLS[sport];
    if (!baseUrl) throw new Error(`Unsupported sport: ${sport}`);

    const url = `${baseUrl}/scoreboard?dates=${date}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const oddsData: Record<string, string> = {};
        data.events.forEach((game: any) => {
            const homeTeam = game.competitions[0]?.competitors.find((t: any) => t.homeAway === 'home')?.team;
            const awayTeam = game.competitions[0]?.competitors.find((t: any) => t.homeAway === 'away')?.team;

            const oddsDetails = game.odds?.details || 'N/A';

            if (homeTeam && awayTeam) {
                oddsData[homeTeam.displayName] = oddsDetails;
                oddsData[awayTeam.displayName] = oddsDetails;
            }
        });

        return oddsData;
    } catch (error) {
        console.error(`Failed to fetch odds data for ${sport}:`, error);
        return {};
    }
}

async function fetchTeamData(sport: string): Promise<Record<string, TeamData>> {
    const baseUrl = BASE_URLS[sport];
    if (!baseUrl) throw new Error(`Unsupported sport: ${sport}`);

    const url = `${baseUrl}/teams`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const teamData: Record<string, TeamData> = {};
        data.sports[0].leagues[0].teams.forEach((team: any) => {
            const teamName = team.team.displayName;
            const abbreviation = team.team.abbreviation || team.team.id;
            const shortName = team.team.shortDisplayName;  // Example: "Thunder", "Nuggets"
            const logo = team.team.logos?.[0]?.href || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';
        
            // Add multiple mappings for better lookup
            teamData[teamName] = { abbreviation, logo };
            teamData[abbreviation] = { abbreviation, logo };
            if (shortName) {
                teamData[shortName] = { abbreviation, logo };  // Handle short display names
            }
        });

        return teamData;
    } catch (error) {
        console.error(`Failed to fetch team data for ${sport}:`, error);
        return {};
    }
}

// Dynamic function for fetching logos
export async function getTeamLogo(teamName: string | undefined, sport: string): Promise<string> {
    if (!teamName) {
        return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';
    }

    const teamData = await fetchTeamData(sport);
    return teamData[teamName]?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png';
}

// Dynamic function for getting team abbreviations
export async function getTeamAbbreviation(teamName?: string, sport?: string): Promise<string> {
    if (!sport || !teamName) return 'unk';
    const teamData = await fetchTeamData(sport);
    return teamData[teamName]?.abbreviation || 'unk';
}
