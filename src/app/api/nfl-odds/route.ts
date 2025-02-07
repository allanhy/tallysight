import { NextResponse } from 'next/server';

const NFL_TEAM_LOGOS: { [key: string]: string } = {
  'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
  'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
  'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
  'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
  'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
  'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
  'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
  'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
  'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
  'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
  'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
  'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
  'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
  'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
  'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
  'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
  'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
  'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
  'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
  'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
  'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
  'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
  'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
  'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
  'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
  'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
  'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
  'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
  'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
  'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
  'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png'
};

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;
  const sport = 'americanfootball_nfl';
  
  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=spreads`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data into our expected format
    const games = data.map((game: any) => ({
      id: game.id,
      date: game.commence_time,
      team1: {
        name: game.home_team,
        spread: game.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.point || 'N/A',
        logo: NFL_TEAM_LOGOS[game.home_team] || 'https://a.espncdn.com/i/teamlogos/default-team-logo-500.png'
      },
      team2: {
        name: game.away_team,
        spread: game.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.point || 'N/A',
        logo: NFL_TEAM_LOGOS[game.away_team] || 'https://a.espncdn.com/i/teamlogos/default-team-logo-500.png'
      },
      status: 'scheduled',
      isAvailable: true
    }));

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error in odds API:', error);
    // If the API fails, return mock data as fallback
    return NextResponse.json({
      games: [
        {
          id: "1",
          date: "2024-03-20T00:00:00Z",
          team1: {
            name: "Kansas City Chiefs",
            spread: "-3.5",
            logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png"
          },
          team2: {
            name: "San Francisco 49ers",
            spread: "+3.5",
            logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png"
          },
          status: "scheduled",
          isAvailable: true
        }
      ]
    });
  }
}