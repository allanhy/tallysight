export interface Team {
  name: string;
  score: string;
  spread?: string; 
  logo?: string;
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeTeamAbbreviation: string;
  awayTeamAbbreviation: string; 
  date: string;
  time: string;
  gameTime: string; // This should now have the correct original time
  fullDate: string;
  status: string;
  homeScore?: string;
  awayScore?: string;
} 