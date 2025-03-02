/* eslint-disable @typescript-eslint/no-unused-vars */
import { Contest } from '../types/contest';
import ContestsPage from '../contests/page';

const now = Date.now();
const offsetDays = (days: number) => new Date(now + days * 86400000).toString();

export enum ContestStatus {
    Open = 'open',
    Completed = 'completed'
}

export async function getNBAContests(): Promise<Contest[]> {
    try {
        const response = await fetch('/api/games');
        const data = await response.json();

        // Convert API game data to contest format
        return data.games.map((game: any) => ({
            id: game.id,
            title: `${game.team1Name} vs ${game.team2Name}`,
            description: "Make your pick for today's NBA matchup!",
            category: "NBA",
            startDate: new Date().toString(), // Use game.startTime if available
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toString(), // 24 hours from now
            participants: 0,
            maxParticipants: 100,
            status: ContestStatus.Open,
            prize: -1,
            maxEntries: 1,
            currentEntries: 0,
            userResult: {
                rank: null,
                points: null,
            },
            teams: {
                team1: {
                    name: game.team1Name,
                    logo: game.team1Logo
                },
                team2: {
                    name: game.team2Name,
                    logo: game.team2Logo
                }
            }
        }));

    } catch (error) {
        console.error('Error fetching NBA contests:', error);
        return [];
    }
}

export const weeklyContests = {
    'current': [],
    1: [
        {
            id: "past1-week1",
            title: "MLB Weekly Challenge",
            description: "Week 1 baseball predictions results",
            category: "MLB",
            startDate: offsetDays(-7),
            endDate: offsetDays(-6),
            participants: 98,
            maxParticipants: 100,
            status: ContestStatus.Completed,
            prize: -1,
            maxEntries: 1,
            currentEntries: 1,
            userResult: {
                rank: 5,
                points: 156,
                position: 5,
                totalParticipants: 98
            }
        },
        {
            id: "past2-week1",
            title: "NFL Weekly Picks",
            description: "Week 1 football predictions results",
            category: "NFL",
            startDate: offsetDays(-7),
            endDate: offsetDays(-6),
            participants: 75,
            maxParticipants: 100,
            status: ContestStatus.Completed,
            prize: -1,
            maxEntries: 1,
            currentEntries: 1,
            userResult: {
                rank: 12,
                points: 142,
                position: 12,
                totalParticipants: 75
            }
        }
    ],
    2: [
        {
            id: "past1-week2",
            title: "NBA Daily Challenge",
            description: "Week 2 basketball predictions results",
            category: "NBA",
            startDate: offsetDays(-14),
            endDate: offsetDays(-13),
            participants: 85,
            maxParticipants: 100,
            status: ContestStatus.Completed,
            prize: -1,
            maxEntries: 1,
            currentEntries: 1,
            userResult: {
                rank: 8,
                points: 165,
                position: 8,
                totalParticipants: 85
            }
        },
        {
            id: "past2-week2",
            title: "MLB Weekly Challenge",
            description: "Week 2 baseball predictions results",
            category: "MLB",
            startDate: offsetDays(-14),
            endDate: offsetDays(-13),
            participants: 92,
            maxParticipants: 100,
            status: ContestStatus.Completed,
            prize: -1,
            maxEntries: 1,
            currentEntries: 1,
            userResult: {
                rank: 3,
                points: 178,
                position: 3,
                totalParticipants: 92
            }
        }
    ],
    3: [
        {
            id: "past1-week3",
            title: "NFL Weekly Challenge",
            description: "Week 3 football predictions results",
            category: "NFL",
            startDate: offsetDays(-21),
            endDate: offsetDays(-20),
            participants: 88,
            maxParticipants: 100,
            status: ContestStatus.Completed,
            prize: -1,
            maxEntries: 1,
            currentEntries: 1,
            userResult: {
                rank: 15,
                points: 134,
                position: 15,
                totalParticipants: 88
            }
        }
    ],
    4: [
        {
            id: "past1-week4",
            title: "NBA Daily Challenge",
            description: "Week 4 basketball predictions results",
            category: "NBA",
            startDate: offsetDays(-28),
            endDate: offsetDays(-27),
            participants: 95,
            maxParticipants: 100,
            status: ContestStatus.Completed,
            prize: -1,
            maxEntries: 1,
            currentEntries: 1,
            userResult: {
                rank: 7,
                points: 168,
                position: 7,
                totalParticipants: 95
            }
        }
    ]
} as const;