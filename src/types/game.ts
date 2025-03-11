export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  gameTime: string;
  status: 'scheduled' | 'in_progress' | 'final';
  // Add any other relevant game properties
} 