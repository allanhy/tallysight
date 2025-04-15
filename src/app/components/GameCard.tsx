import { Game } from '../types/game';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const formatDateWithTimezone = (date: Date, timeZone: string, formatStr: string = 'EEEE, MMM d, h:mm a'): string => {
  try {
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const GameCard = ({ game, userTimeZone }: { game: Game, userTimeZone: string }) => {
  console.log('Game data in card:', game);
  console.log('Raw game date:', game.fullDate);
  console.log('Parsed game date:', new Date(game.fullDate));

  const gameDate = new Date(game.fullDate);
  const isValidDate = !isNaN(gameDate.getTime());
  console.log('Raw game.date:', gameDate);

  // Function to shorten team names
  const shortenTeamName = (name: string) => {
    // Common abbreviations for teams
    const shortNames: { [key: string]: string } = {
      // NFL Teams
      'Tampa Bay Buccaneers': 'TB Buccaneers',
      'San Francisco 49ers': 'SF 49ers',
      'New England Patriots': 'NE Patriots',
      'New Orleans Saints': 'NO Saints',
      'New York Giants': 'NY Giants',
      'New York Jets': 'NY Jets',
      'Green Bay Packers': 'GB Packers',
      'Kansas City Chiefs': 'KC Chiefs',
      'Los Angeles Rams': 'LA Rams',
      'Los Angeles Chargers': 'LA Chargers',
      'Las Vegas Raiders': 'LV Raiders',
      'Jacksonville Jaguars': 'JAX Jaguars',

      // NBA Teams
      'Golden State Warriors': 'GS Warriors',
      'Los Angeles Lakers': 'LA Lakers',
      'Los Angeles Clippers': 'LA Clippers',
      'Portland Trail Blazers': 'POR Blazers',
      'Oklahoma City Thunder': 'OKC Thunder',
      'San Antonio Spurs': 'SA Spurs',

      // MLB Teams
      'Boston Red Sox': 'BOS Red Sox',
      'Chicago White Sox': 'CHW White Sox',
      'Toronto Blue Jays': 'TOR Blue Jays',
      'Los Angeles Angels': 'LA Angels',
      'Los Angeles Dodgers': 'LA Dodgers',

      // Soccer Teams
      'Manchester United': 'Man United',
      'Manchester City': 'Man City',
      'Tottenham Hotspur': 'Tottenham',
      'Wolverhampton Wanderers': 'Wolves',
      'Sheffield United': 'Sheffield Utd',
      'Newcastle United': 'Newcastle',
      'Nottingham Forest': 'Nottm Forest',
      'Crystal Palace': 'Crystal Pal',
      'Brighton & Hove Albion': 'Brighton',
      'West Ham United': 'West Ham',
      'Aston Villa': 'Villa',

      // European Soccer Teams
      'Paris Saint-Germain': 'PSG',
      'Borussia Dortmund': 'Dortmund',
      'Bayern München': 'Bayern',
      'RB Leipzig': 'Leipzig',
      'Bayer Leverkusen': 'Leverkusen',
      'Atlético Madrid': 'Atlético',
      'Athletic Club': 'Athletic',
      'Real Sociedad': 'La Real',
      'Inter Milan': 'Inter',
      'AC Milan': 'Milan',
      'Napoli': 'Napoli',
    };

    if (shortNames[name]) {
      return shortNames[name];
    }

    if (name.length > 15 && name.includes(' ')) {
      const words = name.split(' ');
      if (words.length === 2) {
        return name;
      }
      return `${words[0]} ${words[words.length - 1]}`;
    }

    return name;
  };

  return (
    <div className="game-card">
      <div className="game-card-inner bg-white dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-500">
        {/* Date and Time */}
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
          {isValidDate
            ? formatDateWithTimezone(gameDate, userTimeZone, 'EEEE, MMM d')
            : 'Date TBD'}
        </div>
        <div className="text-base sm:text-lg font-bold text-black dark:text-white mb-2">
          {isValidDate
            ? formatDateWithTimezone(gameDate, userTimeZone, 'h:mm a')
            : 'Time TBD'}
        </div>

        {/* Teams Section */}
        <div className="flex items-center justify-between space-x-2 mb-auto">
          {/* Away Team */}
          <div className="team-container">
            <div className="flex-shrink-0 w-8 h-8">
              {game.awayTeam.logo && (
                <img
                  src={game.awayTeam.logo}
                  alt={`${game.awayTeam.name} logo`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="team-info">
              <span className="team-name font-medium text-black dark:text-white hidden md:block">
                {shortenTeamName(game.awayTeam.name)}
              </span>
              <span className="team-name font-medium text-black dark:text-white block md:hidden">
                {game.awayTeamAbbreviation.toUpperCase()}
              </span>
              <span className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-bold h-6">
                {(game.status === 'STATUS_IN_PROGRESS' ||
                  game.status === 'STATUS_FIRST_HALF' ||
                  game.status === 'STATUS_HALFTIME' ||
                  game.status === 'STATUS_SECOND_HALF' ||
                  game.status === 'STATUS_FINAL' ||
                  game.status === 'STATUS_FULL_TIME' ||
                  game.status === 'STATUS_END_PERIOD' ||
                  game.status === 'IN_PROGRESS') &&
                  game.awayScore}
              </span>
            </div>
          </div>

          {/* VS */}
          <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0 px-1">@</span>

          {/* Home Team */}
          <div className="team-container justify-end">
            <div className="team-info items-end">
              <span className="team-name font-medium text-black dark:text-white text-right hidden md:block">
                {shortenTeamName(game.homeTeam.name)}
              </span>
              <span className="team-name font-medium text-black dark:text-white text-right block md:hidden">
                {game.homeTeamAbbreviation.toUpperCase()}
              </span>
              <span className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-bold h-6">
                {(game.status === 'STATUS_IN_PROGRESS' ||
                  game.status === 'STATUS_FIRST_HALF' ||
                  game.status === 'STATUS_HALFTIME' ||
                  game.status === 'STATUS_SECOND_HALF' ||
                  game.status === 'STATUS_FINAL' ||
                  game.status === 'STATUS_FULL_TIME' ||
                  game.status === 'STATUS_END_PERIOD' ||
                  game.status === 'IN_PROGRESS') &&
                  game.homeScore}
              </span>
            </div>
            <div className="flex-shrink-0 w-8 h-8">
              {game.homeTeam.logo && (
                <img
                  src={game.homeTeam.logo}
                  alt={`${game.homeTeam.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Error loading home team logo:', e);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-xs sm:text-sm text-gray-500 mt-2">
          {(() => {
            switch (game.status?.toLowerCase()) {
              case 'status_final': return 'Final';
              case 'status_in_progress':
              case 'status_end_period':
                return 'In Progress';
              case 'status_first_half': return 'First Half';
              case 'status_halftime': return 'Halftime';
              case 'status_second_half': return 'Second Half';
              case 'status_full_time': return 'Full Time';
              case 'status_delayed': return 'Delayed';
              case 'status_postponed': return 'Postponed';
              case 'status_canceled': return 'Canceled';
              default: return 'Scheduled';
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default GameCard; 