/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '@vercel/postgres';
import { GET } from '../../src/app/api/leaderboard-entries/getEntriesForLeaderboard/route';

jest.mock('@vercel/postgres', () => ({
  db: {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn(),
    }),
  },
}));

jest.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn().mockResolvedValue({ data: [] }),
    },
  },
}));

describe('Get Specific Sport and Week Leaderboard', () => {
  let mockDbClient: any;

  beforeEach(() => {
    mockDbClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (db.connect as jest.Mock).mockResolvedValue(mockDbClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when required parameters are missing', async () => {
    const request = new Request('http://localhost/api/leaderboard-entries/getEntriesForLeaderboard'); // Simulate a request
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      message: 'Missing Fields Required: leaderboard_id, sport, week',
    });
  });

  it('should return 200 when no users are found', async () => {
    mockDbClient.query.mockResolvedValue({ rows: [] });

    const request = new Request('http://localhost/api/leaderboard-entries/getEntriesForLeaderboard?sport=NBA&week=1');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('should return leaderboard data successfully when users are found', async () => {
    mockDbClient.query.mockResolvedValue({
      rows: [
        {
          user_id: '2',
          clerk_id: 'user_2skB8AXewKeSxcztcy6SMctgENA',
          username: 'Katrina',
          points: 31,
          rank: 3,
          performance: 100.0,
          bio: null,
          fav_team: 'test bio',
          max_points: 33,
        },
      ],
    });

    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: [{ id: 'user_2skB8AXewKeSxcztcy6SMctgENA', imageUrl: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ1amtmR01idTlsVkx3SkhyUVc2VDBCRkxUUyJ9' }],
    });

    const request = new Request('http://localhost/api/leaderboard-entries/getEntriesForLeaderboard?sport=NBA&week=12');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([
      {
        user_id: '2',
        clerk_id: 'user_2skB8AXewKeSxcztcy6SMctgENA',
        username: 'Katrina',
        points: 31,
        rank: 3,
        performance: 100.0,
        bio: null,
        fav_team: 'test bio',
        max_points: 33,
        imageUrl: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ1amtmR01idTlsVkx3SkhyUVc2VDBCRkxUUyJ9',
      },
    ]);
  });
});
