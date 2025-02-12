import { NextResponse } from 'next/server';

// ESPN CDN URLs for NFL team logos

export async function GET() {
    try {
        const NFL_TEAM_LOGOS: { [key: string]: string } = { /* NFL logos */
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
        'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png' };

        const NBA_TEAM_LOGOS: { [key: string]: string } = { /* NBA logos */
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

        const nflTeams = Object.entries(NFL_TEAM_LOGOS).map(([name, logoUrl], index) => ({
            id: index + 1,
            name,
            logoUrl,
            league: 'NFL'
        }));

        const nbaTeams = Object.entries(NBA_TEAM_LOGOS).map(([name, logoUrl], index) => ({
            id: nflTeams.length + index + 1,
            name,
            logoUrl,
            league: 'NBA'
        }));

        const teams = [...nflTeams, ...nbaTeams];

        return NextResponse.json({ teams });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Received POST request:', body);

        if (!body.team || !Array.isArray(body.team)) {
            return NextResponse.json({ error: 'Invalid team data' }, { status: 400 });
        }

        console.log('Saving favorite teams:', body.team);
        return NextResponse.json({ message: 'Favorite team saved!', team: body.team }, { status: 200 });
    } catch (error) {
        console.error('Error saving favorite team line 110:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}