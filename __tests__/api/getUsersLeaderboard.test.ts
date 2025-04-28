/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '@vercel/postgres';
import { GET } from '../../src/app/api/user/getUsersLeaderboard/route';
import { NextRequest } from 'next/server';

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

describe('Get Overall Leaderboard', () => {
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

  it('should return 404 when no users are found', async () => {
    mockDbClient.query.mockResolvedValue({ rows: [] });

    const req = new NextRequest('http://localhost/api/user/getUsersLeaderboard');
    const response = await GET(req);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      success: false,
      message: 'No users available',
    });
  });

  it('should return leaderboard data successfully if users found', async () => {
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
          fav_team: null,
          max_points: 33,
        },
      ],
    });

    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: [{ id: 'user_2skB8AXewKeSxcztcy6SMctgENA', imageUrl: 'https://test.com/image.jpg' }],
    });

    const req = new NextRequest('http://localhost/api/user/getUsersLeaderboard');
    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: [
        {
          user_id: '2',
          clerk_id: 'user_2skB8AXewKeSxcztcy6SMctgENA',
          username: 'Katrina',
          points: 31,
          rank: 3,
          performance: 100.0,
          bio: null,
          fav_team: null,
          max_points: 33,
          imageUrl: 'https://test.com/image.jpg',
        },
      ],
    });
  });

  it('should return 500 when database query fails', async () => {
    mockDbClient.query.mockRejectedValue(new Error('Database error'));

    const req = new NextRequest('http://localhost/api/user/getUsersLeaderboard');
    const response = await GET(req);

    expect(response.status).toBe(500);
    const jsonResponse = await response.json();
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse.message).toContain('Internal Server Error');
  });
});
