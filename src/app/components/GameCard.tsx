import { Game } from '../types/game';

export const GameCard = ({ game }: { game: Game }) => {
  console.log('Game data in card:', game);

  const gameDate = new Date(game.date);
  const isValidDate = !isNaN(gameDate.getTime());

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
      <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
        {/* Date and Time */}
        <div className="text-sm text-gray-600 mb-1">
          {isValidDate 
            ? gameDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })
            : 'Date TBD'}
        </div>
        <div className="text-lg font-bold text-black mb-2">
          {game.time || 'Time TBD'}
        </div>
  
        {/* Teams with Logos */}
        <div className="flex items-center justify-between space-x-2 mb-auto">
          {/* Away Team */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8">
              {game.awayTeamLogo && (
                <img 
                  src={game.awayTeamLogo} 
                  alt={`${game.awayTeam} logo`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-black truncate">
                {shortenTeamName(game.awayTeam)}
              </span>
              <span className="text-lg text-gray-600 font-bold h-6">
                {(game.status === 'STATUS_IN_PROGRESS' || 
                  game.status === 'STATUS_HALFTIME' || 
                  game.status === 'STATUS_FINAL' ||
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
              <span className="text-sm font-medium text-black truncate">
                {shortenTeamName(game.homeTeam)}
              </span>
              <span className="text-lg text-gray-600 font-bold h-6">
                {(game.status === 'STATUS_IN_PROGRESS' || 
                  game.status === 'STATUS_HALFTIME' || 
                  game.status === 'STATUS_FINAL' ||
                  game.status === 'IN_PROGRESS') && 
                  game.homeScore ? game.homeScore : ''}
              </span>
            </div>
            {game.homeTeamLogo && (
              <img 
                src={game.homeTeamLogo} 
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
                case 'status_halftime':
                  return 'Halftime';
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