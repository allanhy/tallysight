import { clerkClient } from '@clerk/clerk-sdk-node';
import { GET } from '@/app/api/user/getUserProfile/route';

// Mock the Clerk client
jest.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}));

describe('GET /api/user/getUserProfile', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should return user profile data successfully', async () => {
    // Mock Clerk user response
    const mockUser = {
      id: 'clerk_123',
      unsafeMetadata: {
        x: 'twitter_handle',
        instagram: 'instagram_handle',
        discord: 'discord_username',
        facebook: 'facebook_profile',
        snapchat: 'snapchat_username',
        favoriteTeam: 'Lakers'
      }
    };

    (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(mockUser);

    // Create mock request with clerkId
    const request = new Request('http://localhost:3000/api/user/getUserProfile?clerkId=clerk_123');

    // Call the route handler
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.socialLinks).toEqual({
      x: 'twitter_handle',
      instagram: 'instagram_handle',
      discord: 'discord_username',
      facebook: 'facebook_profile',
      snapchat: 'snapchat_username'
    });
    expect(data.favoriteTeam).toBe('Lakers');
  });

  it('should return 400 when clerkId is missing', async () => {
    // Create mock request without clerkId
    const request = new Request('http://localhost:3000/api/user/getUserProfile');

    // Call the route handler
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Clerk ID is required');
    expect(clerkClient.users.getUser).not.toHaveBeenCalled();
  });

  it('should return 404 when user is not found', async () => {
    // Mock Clerk user not found
    (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(null);

    // Create mock request
    const request = new Request('http://localhost:3000/api/user/getUserProfile?clerkId=non_existent');

    // Call the route handler
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('User not found');
  });

  it('should handle missing social media links gracefully', async () => {
    // Mock Clerk user with no social media links
    const mockUser = {
      id: 'clerk_123',
      unsafeMetadata: {}
    };

    (clerkClient.users.getUser as jest.Mock).mockResolvedValueOnce(mockUser);

    // Create mock request
    const request = new Request('http://localhost:3000/api/user/getUserProfile?clerkId=clerk_123');

    // Call the route handler
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.socialLinks).toEqual({
      x: '',
      instagram: '',
      discord: '',
      facebook: '',
      snapchat: ''
    });
    expect(data.favoriteTeam).toBeNull();
  });

  it('should handle Clerk API errors gracefully', async () => {
    // Mock Clerk API error
    (clerkClient.users.getUser as jest.Mock).mockRejectedValueOnce(new Error('Clerk API Error'));

    // Create mock request
    const request = new Request('http://localhost:3000/api/user/getUserProfile?clerkId=clerk_123');

    // Call the route handler
    const response = await GET(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Internal Server Error');
  });
});
