// components/FavoriteTeam.tsx
import { useState, useEffect } from 'react';

export type Team = {
  id: number;
  name: string;
  logoUrl: string;
};

type FavoriteTeamsModalProps = {
  onClose: () => void;
  onSave: (teams: Team[]) => void;
};

const FavoriteTeamsModal = ({ onClose, onSave }: FavoriteTeamsModalProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/FavoriteTeams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data.teams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError('Failed to load teams. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSave = () => {
    // Get the full team objects for the selected IDs
    const favoriteTeams = teams.filter((team) =>
      selectedTeams.includes(team.id)
    );
    onSave(favoriteTeams);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-[#008AFF]">
          Select Your Favorite Teams
        </h2>
        <div className="max-h-60 overflow-y-auto mb-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008AFF]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : teams.length === 0 ? (
            <div className="text-center text-gray-500">No teams found</div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className={`flex items-center p-2 cursor-pointer border rounded mb-2 ${
                  selectedTeams.includes(team.id) ? 'bg-blue-200' : 'bg-white'
                }`}
                onClick={() => toggleTeamSelection(team.id)}
              >
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="w-8 h-8 mr-2 object-contain"
                  onError={(e) => {
                    // Fallback image if logo fails to load
                    (e.target as HTMLImageElement).src = '/placeholder-team-logo.png';
                  }}
                />
                <span className="font-bold text-[#008AFF]">{team.name}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-[#008AFF] hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteTeamsModal;