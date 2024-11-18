export interface UserResult {
    position?: number;
    totalParticipants?: number;
    rank: number | null;
    points: number | null;
    winnings?: number | null;
}

export interface Contest {
    id: string;
    title: string;
    description: string;
    category: 'NFL' | 'NBA' | 'MLB';
    currentEntries: number;
    maxEntries: number;
    startDate: string;
    endDate: string;
    participants: number;
    maxParticipants: number;
    status: 'open' | 'completed' | 'closed';
    prize: number;
    userResult?: UserResult;
    entryFee?: number;
}