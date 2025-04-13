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
    const shortNames: { [key: string]: string } = {
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
    };
    return shortNames[name] || name;
  };

  return (
    <div className="h-[180px] w-full max-w-[400px] mx-auto">
      <div className="bg-white dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-500 p-4 h-full flex flex-col">
        {/* Date and Time */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {isValidDate
            ? formatDateWithTimezone(gameDate, userTimeZone, 'EEEE, MMM d')
            : 'Date TBD'}
        </div>
        <div className="text-lg font-bold text-black dark:text-white mb-2">
          {isValidDate
            ? formatDateWithTimezone(gameDate, userTimeZone, 'h:mm a')
            : 'Time TBD'}
        </div>

        {/* Teams with Logos */}
        <div className="flex items-center justify-between space-x-2 mb-auto">
          {/* Away Team */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8">
              {game.awayTeam.logo && (
                <img
                  src={game.awayTeam.logo}
                  alt={`${game.awayTeam} logo`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-black dark:text-white truncate hidden md:block">
                {shortenTeamName(game.awayTeam.name)}
              </span>
              <span className="text-sm font-medium text-black dark:text-white truncate block md:hidden">
                {game.awayTeamAbbreviation.toUpperCase()}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400 font-bold h-6">
                {(game.status === 'STATUS_IN_PROGRESS' ||
                  game.status === 'STATUS_FIRST_HALF' ||
                  game.status === 'STATUS_HALFTIME' ||
                  game.status === 'STATUS_SECOND_HALF' ||
                  game.status === 'STATUS_FINAL' ||
                  game.status === 'STATUS_FULL_TIME' ||
                  game.status === 'IN_PROGRESS') &&
                  game.awayScore ? game.awayScore : ''}
              </span>
            </div>
          </div>

          {/* VS */}
          <span className="text-sm text-gray-500 flex-shrink-0 px-1">@</span>

          {/* Home Team */}
          <div className="flex items-center space-x-2 inset-y-1 right-1 flex-1 min-w-0 justify-end">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-black dark:text-white truncate hidden md:block">
                {shortenTeamName(game.homeTeam.name)}
              </span>
              <span className="text-sm font-medium text-black dark:text-white truncate block md:hidden">
                {game.homeTeamAbbreviation.toUpperCase()}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400 font-bold h-6">
                {(game.status === 'STATUS_IN_PROGRESS' ||
                  game.status === 'STATUS_FIRST_HALF' ||
                  game.status === 'STATUS_HALFTIME' ||
                  game.status === 'STATUS_SECOND_HALF' ||
                  game.status === 'STATUS_FINAL' ||
                  game.status === 'STATUS_FULL_TIME' ||
                  game.status === 'IN_PROGRESS') &&
                  game.homeScore ? game.homeScore : ''}
              </span>
            </div>
            {game.homeTeam.logo && (
              <img
                src={game.homeTeam.logo}
                alt={`${game.homeTeam} logo`}
                className="w-8 h-8 object-contain ml-2"
                onError={(e) => {
                  console.error('Error loading home team logo:', e);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        <div className="flex-grow"></div>
        <div className="text-sm text-gray-500 mt-2">
          {(() => {
            switch (game.status?.toLowerCase()) {
              case 'status_final':
                return 'Final';
              case 'status_in_progress':
                return 'In Progress';
              case 'status_first_half':
                return 'First Half';
              case 'status_halftime':
                return 'Halftime';
              case 'status_second_half':
                return 'Second Half';
              case 'status_full_time':
                return 'Full Time';
              case 'status_delayed':
                return 'Delayed';
              case 'status_postponed':
                return 'Postponed';
              case 'status_canceled':
                return 'Canceled';
              default:
                return 'Scheduled';
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default GameCard; 