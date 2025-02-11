interface GameOdds {
  favorite: string;
  spread: string;
  overUnder: string;
  homeTeamMoneyLine: string;
  awayTeamMoneyLine: string;
  provider: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface GameCardProps {
  // ... existing props ...
  odds: GameOdds;
} 