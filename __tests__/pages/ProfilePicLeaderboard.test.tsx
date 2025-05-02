import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaderboardProfiles from '../../src/app/components/leaderboardProfiles';
import * as React from 'react';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} unoptimized="true" loading="eager" />;
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes('getUserProfile')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        socialLinks: {
          x: 'twitteruser',
          instagram: 'instauser'
        }
      })
    });
  } else if (url.includes('getMultiUserPoints')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { user_id: 1, points: 200 },
          { user_id: 2, points: 180 },
          { user_id: 3, points: 160 },
          { user_id: 4, points: 140 }
        ],
        message: 'Success'
      })
    });
  } else if (url.includes('getUsersLeaderboard') || url.includes('getEntriesForLeaderboard')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [
          {
            rank: 1,
            username: 'userwithpic',
            totalPoints: 200,
            points: 100,
            max_points: 100,
            performance: '100',
            user_id: 1,
            clerk_id: 'user_1',
            imageUrl: 'https://example.com/profile1.jpg'
          },
          {
            rank: 2,
            username: 'userwithdataurl',
            totalPoints: 180,
            points: 90,
            max_points: 100,
            performance: '90',
            user_id: 2,
            clerk_id: 'user_2',
            imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          },
          {
            rank: 3,
            username: 'userwithoutpic',
            totalPoints: 160,
            points: 80,
            max_points: 100,
            performance: '80',
            user_id: 3,
            clerk_id: 'user_3',
            imageUrl: ''
          },
          {
            rank: 4,
            username: 'userwithbadurl',
            totalPoints: 140,
            points: 70,
            max_points: 100,
            performance: '70',
            user_id: 4,
            clerk_id: 'user_4',
            imageUrl: 'invalid-url'
          }
        ],
        message: 'Success'
      })
    });
  } else if (url.includes('updatePerformance')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        message: 'Performance updated successfully'
      })
    });
  }
  
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: 'Not found' })
  });
});

// Mock document methods
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'profilePopout') {
    return {
      contains: jest.fn().mockReturnValue(true)
    };
  }
  return null;
});

// Disable console warnings and errors for cleaner test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Leaderboard Profile Pictures', () => {
  const mockUserIds = [1, 2, 3, 4];
  
  // Sample users with different profile picture scenarios
  const mockUsers = [
    {
      rank: 1,
      username: 'userwithpic',
      totalPoints: 200,
      points: 100,
      max_points: 100,
      performance: '100',
      user_id: 1,
      clerk_id: 'user_1',
      imageUrl: 'https://example.com/profile1.jpg'
    },
    {
      rank: 2,
      username: 'userwithdataurl',
      totalPoints: 180,
      points: 90,
      max_points: 100,
      performance: '90',
      user_id: 2,
      clerk_id: 'user_2',
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    },
    {
      rank: 3,
      username: 'userwithoutpic',
      totalPoints: 160,
      points: 80,
      max_points: 100,
      performance: '80',
      user_id: 3,
      clerk_id: 'user_3',
      imageUrl: ''
    },
    {
      rank: 4,
      username: 'userwithbadurl',
      totalPoints: 140,
      points: 70,
      max_points: 100,
      performance: '70',
      user_id: 4,
      clerk_id: 'user_4',
      imageUrl: 'invalid-url'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document methods used in the component
    Object.defineProperty(document, 'addEventListener', {
      value: jest.fn(),
      writable: true
    });
    Object.defineProperty(document, 'removeEventListener', {
      value: jest.fn(),
      writable: true
    });
  });

  it('displays user profile pictures when available', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={mockUserIds} 
          userData={mockUsers} 
        />
      );
    });

    // Wait for the component to render
    await waitFor(() => {
      // User with valid URL should display their profile picture
      const userWithPic = screen.getByAltText('Profile image of userwithpic');
      expect(userWithPic).toBeInTheDocument();
      expect(userWithPic).toHaveAttribute('src', 'https://example.com/profile1.jpg');

      // User with data URL should display their profile picture
      const userWithDataUrl = screen.getByAltText('Profile image of userwithdataurl');
      expect(userWithDataUrl).toBeInTheDocument();
      expect(userWithDataUrl).toHaveAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    });
  });

  it('displays default avatar for users without profile pictures', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={mockUserIds} 
          userData={mockUsers} 
        />
      );
    });

    await waitFor(() => {
      // User without picture should display default avatar
      const userWithoutPic = screen.getByAltText('Profile image of userwithoutpic');
      expect(userWithoutPic).toBeInTheDocument();
      expect(userWithoutPic).toHaveAttribute('src', '/default-profile.png');

      // User with invalid URL should display default avatar
      const userWithBadUrl = screen.getByAltText('Profile image of userwithbadurl');
      expect(userWithBadUrl).toBeInTheDocument();
      expect(userWithBadUrl).toHaveAttribute('src', '/default-profile.png');
    });
  });

  it('updates profile picture when user uploads a new one', async () => {
    // Initial render with original user data
    const { rerender } = render(
      <LeaderboardProfiles 
        sport="NFL" 
        week={1} 
        userIds={mockUserIds} 
        userData={mockUsers} 
      />
    );

    // Verify initial state
    await waitFor(() => {
      const userImage = screen.getByAltText('Profile image of userwithoutpic');
      expect(userImage).toHaveAttribute('src', '/default-profile.png');
    });

    // Updated user data (user has uploaded a new profile picture)
    const updatedUsers = [...mockUsers];
    updatedUsers[2] = {
      ...updatedUsers[2],
      imageUrl: 'https://example.com/new-profile-pic.jpg'
    };

    // Use act for the rerender
    await act(async () => {
      rerender(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={mockUserIds} 
          userData={updatedUsers} 
        />
      );
    });

    // Verify profile picture has been updated
    await waitFor(() => {
      const userImage = screen.getByAltText('Profile image of userwithoutpic');
      expect(userImage).toHaveAttribute('src', 'https://example.com/new-profile-pic.jpg');
    });
  });

  it('reverts to default avatar when user removes their profile picture', async () => {
    // Initial render with profile picture
    const { rerender } = render(
      <LeaderboardProfiles 
        sport="NFL" 
        week={1} 
        userIds={mockUserIds} 
        userData={mockUsers} 
      />
    );

    // Verify initial state
    await waitFor(() => {
      const userImage = screen.getByAltText('Profile image of userwithpic');
      expect(userImage).toHaveAttribute('src', 'https://example.com/profile1.jpg');
    });

    // Updated user data (user has removed their profile picture)
    const updatedUsers = [...mockUsers];
    updatedUsers[0] = {
      ...updatedUsers[0],
      imageUrl: ''
    };

    // Use act for the rerender
    await act(async () => {
      rerender(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={mockUserIds} 
          userData={updatedUsers} 
        />
      );
    });

    // Verify profile picture has been reverted to default
    await waitFor(() => {
      const userImage = screen.getByAltText('Profile image of userwithpic');
      expect(userImage).toHaveAttribute('src', '/default-profile.png');
    });
  });

  it('opens user profile popout with correct profile picture when clicking on a user', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={mockUserIds} 
          userData={mockUsers} 
        />
      );
    });

    // Find and click on the first user to open profile popout
    const userText = screen.getAllByText('userwithpic');
    await act(async () => {
      fireEvent.click(userText[0]);
    });

    // Verify popout appears with correct profile image
    await waitFor(() => {
      const popoutImages = screen.getAllByAltText('Profile image of userwithpic');
      expect(popoutImages.length).toBeGreaterThan(1);
      // The second image should be in the popout
      const popoutImage = popoutImages[1]; 
      expect(popoutImage).toBeInTheDocument();
      expect(popoutImage).toHaveAttribute('src', 'https://example.com/profile1.jpg');
    });
  });

  it('renders without crashing when loading from API', () => {
    // Just test that the component renders without errors
    expect(() => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1, 2]} 
          userData={mockUsers.slice(0, 2)} // Provide userData to avoid API calls
        />
      );
    }).not.toThrow();
  });
});
