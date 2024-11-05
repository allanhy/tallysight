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
      <div className="bg-white rounded-lg shadow-lg p-4 h-full">
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
        <div className="text-lg font-bold text-black mb-4">
          {game.time || 'Time TBD'}
        </div>

        {/* Teams with Logos */}
        <div className="flex items-center justify-between space-x-2">
          {/* Home Team */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8">
              {game.homeTeamLogo && (
                <img 
                  src={game.homeTeamLogo} 
                  alt={`${game.homeTeam} logo`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <span className="text-sm font-medium text-black truncate">
              {shortenTeamName(game.homeTeam)}
            </span>
          </div>

          {/* VS */}
          <span className="text-xs text-gray-500 flex-shrink-0 px-1">vs</span>

          {/* Away Team */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-sm font-medium text-black truncate">
              {shortenTeamName(game.awayTeam)}
            </span>
            {game.awayTeamLogo && (
              <img 
                src={game.awayTeamLogo} 
                alt={`${game.awayTeam} logo`}
                className="w-8 h-8 object-contain ml-2"
                onError={(e) => {
                  console.error('Error loading away team logo:', e);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 text-sm text-gray-500">
          {game.status?.toLowerCase() || 'scheduled'}
        </div>
      </div>
    </div>
  );
};

export default GameCard; 