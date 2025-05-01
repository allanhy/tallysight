import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '@vercel/postgres';
import { GET } from '@/app/api/user/getUsersLeaderboard/route';

// Mock the database and Clerk client
jest.mock('@vercel/postgres', () => ({
  db: {
    connect: jest.fn(),
  },
}));

jest.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
    },
  },
}));

describe('GET /api/user/getUsersLeaderboard', () => {
  let mockClient: any;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock query function
    mockQuery = jest.fn();
    mockClient = {
      query: mockQuery,
      release: jest.fn(),
    };

    // Mock database connection
    (db.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  it('should return users with their ranks and Clerk data', async () => {
    // Mock database response
    const mockDbUsers = [
      { user_id: 1, clerk_id: 'clerk_1', points: 100, rank: 1 },
      { user_id: 2, clerk_id: 'clerk_2', points: 90, rank: 2 },
    ];

    // Mock Clerk response
    const mockClerkUsers = {
      data: [
        { id: 'clerk_1', imageUrl: 'https://example.com/user1.jpg' },
        { id: 'clerk_2', imageUrl: 'https://example.com/user2.jpg' },
      ],
    };

    mockQuery.mockResolvedValueOnce({ rows: mockDbUsers });
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValueOnce(mockClerkUsers);

    // Create mock request
    const request = new Request('http://localhost:3000/api/user/getUsersLeaderboard');

    // Call the route handler
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]).toHaveProperty('imageUrl', 'https://example.com/user1.jpg');
    expect(data.data[1]).toHaveProperty('imageUrl', 'https://example.com/user2.jpg');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should handle specific user IDs when provided', async () => {
    const mockDbUsers = [
      { user_id: 1, clerk_id: 'clerk_1', points: 100, rank: 1 },
    ];

    const mockClerkUsers = {
      data: [
        { id: 'clerk_1', imageUrl: 'https://example.com/user1.jpg' },
      ],
    };

    mockQuery.mockResolvedValueOnce({ rows: mockDbUsers });
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValueOnce(mockClerkUsers);

    const request = new Request('http://localhost:3000/api/user/getUsersLeaderboard?user_id=1');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = ANY($1)'), [1]);
  });

  it('should return 404 when no users are found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const request = new Request('http://localhost:3000/api/user/getUsersLeaderboard');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('No users available');
  });

  it('should handle database errors gracefully', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Database error'));

    const request = new Request('http://localhost:3000/api/user/getUsersLeaderboard');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Internal Server Error');
  });
});
