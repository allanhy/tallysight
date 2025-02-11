interface GameOdds {
  favorite: string;
  spread: string;
  overUnder: string;
  homeTeamMoneyLine: string;
  awayTeamMoneyLine: string;
  provider: string;
}

interface GameCardProps {
  // ... existing props ...
  odds: GameOdds;
} 