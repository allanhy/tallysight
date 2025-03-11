import { useState, useEffect, useCallback, useRef } from 'react';

export type Team = {
  id: number;
  name: string;
  logoUrl: string;
  league: string;
};

type FavoriteTeamsModalProps = {
  onClose: () => void;
  onSave: (team: Team) => void;
};

const FavoriteTeamsModal = ({ onClose, onSave }: FavoriteTeamsModalProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLeague, setActiveLeague] = useState<'NFL' | 'NBA'>('NFL');
  
  const modalRef = useRef<HTMLDialogElement>(null);
 

  // Handle escape key to close modal
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Focus trap and keyboard handling
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/FavoriteTeams');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch teams');
        }
        
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

  const handleSave = async () => {
    if (!selectedTeamId) return;

    const selectedTeam = teams.find((team) => team.id === selectedTeamId);
    if (!selectedTeam) return;

    try {
      onSave(selectedTeam);
    } catch (error) {
      console.error('Error validating team:', error);
      setError('Failed to validate team selection. Please try again.');
    }
  };

  const renderTeamGrid = (leagueTeams: Team[]) => {
    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {leagueTeams.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelectedTeamId(team.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTeamId === team.id
                ? 'border-[#008AFF] bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <img
                src={team.logoUrl}
                alt={`${team.name} logo`}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-team-logo.png';
                }}
              />
              <span className="text-sm font-medium text-center">{team.name}</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <output className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008AFF]" aria-label="Loading teams" />
        </div>
      );
    }

    if (error) {
      return (
        <output className="text-red-500 text-center" aria-live="assertive">
          {error}
        </output>
      );
    }

    if (teams.length === 0) {
      return (
        <output className="text-center text-gray-500">
          No teams found
        </output>
      );
    }

    // Group teams by league
    const nflTeams = teams.filter(team => team.league === 'NFL');
    const nbaTeams = teams.filter(team => team.league === 'NBA');

    return (
      <div>
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 -mb-px text-sm font-medium ${
              activeLeague === 'NFL'
                ? 'text-[#008AFF] border-b-2 border-[#008AFF]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveLeague('NFL')}
          >
            NFL Teams
          </button>
          <button
            className={`px-4 py-2 -mb-px text-sm font-medium ${
              activeLeague === 'NBA'
                ? 'text-[#008AFF] border-b-2 border-[#008AFF]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveLeague('NBA')}
          >
            NBA Teams
          </button>
        </div>
        
        <div className="mt-4">
          {activeLeague === 'NFL' ? renderTeamGrid(nflTeams) : renderTeamGrid(nbaTeams)}
        </div>
      </div>
    );
  };

  const selectedTeam = selectedTeamId ? teams.find(t => t.id === selectedTeamId) : null;

  return (
    <dialog 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      ref={modalRef}
      open
    >
      <div className="bg-white rounded-lg flex flex-col w-[800px] max-h-[80vh]">
        {/* Header */}
        <h2 id="modal-title" className="text-2xl font-bold p-6 pb-4 text-[#008AFF]">
          Select Your Favorite Team
        </h2>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          {renderContent()}
          {selectedTeam && (
            <output 
              className="mt-4 flex items-center justify-center"
              aria-live="polite"
            >
              <img
                src={selectedTeam.logoUrl}
                alt={`${selectedTeam.name} logo`}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-team-logo.png';
                }}
              />
            </output>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="border-t p-6 bg-white rounded-b-lg">
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-[#008AFF] hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !selectedTeamId}
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default FavoriteTeamsModal;
