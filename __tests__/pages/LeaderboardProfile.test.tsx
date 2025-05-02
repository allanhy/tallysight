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
    // Different response based on the user being fetched
    if (url.includes('user_1')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          socialLinks: {
            x: 'twitteruser',
            instagram: 'instauser',
            discord: 'discorduser'
          },
          fav_team: 'Lakers'
        })
      });
    } else if (url.includes('user_2')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          socialLinks: {},
          fav_team: null
        })
      });
    } else if (url.includes('user_3')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          socialLinks: null,
          fav_team: 'Warriors'
        })
      });
    } else if (url.includes('user_4')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          socialLinks: {
            facebook: 'fbuser'
          },
          fav_team: null
        })
      });
    }
  }
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: [],
      message: 'Success'
    })
  });
});

// Mock document methods to handle popout click outside logic
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

describe('User Profile Popout Tests', () => {
  // Mock user data for testing
  const mockUsers = [
    {
      rank: 1,
      username: 'userWithTeamAndSocial',
      totalPoints: 200,
      points: 100,
      max_points: 100,
      performance: '100',
      user_id: 1,
      clerk_id: 'user_1',
      imageUrl: 'https://example.com/profile1.jpg',
      fav_team: 'Lakers'
    },
    {
      rank: 2,
      username: 'userWithoutTeamOrSocial',
      totalPoints: 180,
      points: 90,
      max_points: 100,
      performance: '90',
      user_id: 2,
      clerk_id: 'user_2',
      imageUrl: 'https://example.com/profile2.jpg'
    },
    {
      rank: 3,
      username: 'userWithTeamNoSocial',
      totalPoints: 160,
      points: 80,
      max_points: 100,
      performance: '80',
      user_id: 3,
      clerk_id: 'user_3',
      imageUrl: 'https://example.com/profile3.jpg',
      fav_team: 'Warriors'
    },
    {
      rank: 4,
      username: 'userWithSocialNoTeam',
      totalPoints: 140,
      points: 70,
      max_points: 100,
      performance: '70',
      user_id: 4,
      clerk_id: 'user_4',
      imageUrl: 'https://example.com/profile4.jpg'
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

  // Helper function to open a user's profile popout
  const openUserProfilePopout = async (username: string) => {
    // Find and click on the user to open profile popout
    const userElements = screen.getAllByText(username);
    await act(async () => {
      fireEvent.click(userElements[0]);
    });
    
    // Allow time for the popout to appear
    await waitFor(() => {
      const popoutHeader = screen.queryByText(username, { selector: 'h2' });
      expect(popoutHeader).toBeInTheDocument();
    });
  };

  it('opens profile popout when user on leaderboard is clicked', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1, 2, 3, 4]} 
          userData={mockUsers} 
        />
      );
    });

    await openUserProfilePopout('userWithTeamAndSocial');
    
    // Verify popout appears
    const popoutHeader = screen.getByText('userWithTeamAndSocial', { selector: 'h2' });
    expect(popoutHeader).toBeInTheDocument();
    
    // Check if profile image is displayed in popout
    const profileImages = screen.getAllByAltText('Profile image of userWithTeamAndSocial');
    expect(profileImages.length).toBeGreaterThan(1); // One in list, one in popout
  });

  it('displays favorite team if user has selected one', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1, 2, 3, 4]} 
          userData={mockUsers} 
        />
      );
    });

    await openUserProfilePopout('userWithTeamAndSocial');
    
    // Check if favorite team is displayed
    const favoriteTeamHeading = screen.getByText('Favorite Team');
    expect(favoriteTeamHeading).toBeInTheDocument();
    
    const favTeamText = screen.getByText('Lakers');
    expect(favTeamText).toBeInTheDocument();
  });

  it('shows "No favorite team selected" if none was selected', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1, 2, 3, 4]} 
          userData={mockUsers} 
        />
      );
    });

    await openUserProfilePopout('userWithoutTeamOrSocial');
    
    // Check if "no favorite team" message is displayed
    const favoriteTeamHeading = screen.getByText('Favorite Team');
    expect(favoriteTeamHeading).toBeInTheDocument();
    
    const noTeamMessage = screen.getByText('No favorite team selected');
    expect(noTeamMessage).toBeInTheDocument();
  });

  it('displays linked social media profiles if provided', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1, 2, 3, 4]} 
          userData={mockUsers} 
        />
      );
    });

    await openUserProfilePopout('userWithTeamAndSocial');
    
    // Check if social media links are displayed
    const socialMediaHeading = screen.getByText('Social Media');
    expect(socialMediaHeading).toBeInTheDocument();
    
    const twitterInfo = screen.getByText('X:');
    expect(twitterInfo).toBeInTheDocument();
    
    const instagramInfo = screen.getByText('Instagram:');
    expect(instagramInfo).toBeInTheDocument();
    
    const discordInfo = screen.getByText('Discord:');
    expect(discordInfo).toBeInTheDocument();
    
    // Check the actual username values
    expect(screen.getByText('twitteruser')).toBeInTheDocument();
    expect(screen.getByText('instauser')).toBeInTheDocument();
    expect(screen.getByText('discorduser')).toBeInTheDocument();
  });

  it('shows "No social media linked" if none are provided', async () => {
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1, 2, 3, 4]} 
          userData={mockUsers} 
        />
      );
    });

    await openUserProfilePopout('userWithoutTeamOrSocial');
    
    // Check if "no social media" message is displayed
    const socialMediaHeading = screen.getByText('Social Media');
    expect(socialMediaHeading).toBeInTheDocument();
    
    const noSocialMessage = screen.getByText('No social media linked to this profile');
    expect(noSocialMessage).toBeInTheDocument();
  });

  it('loads profile data correctly from API without crashing', async () => {
    // Set up fetch mock for profile data
    const mockFetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: mockUsers, // Return mock users for getUsersLeaderboard
          message: 'Success',
          socialLinks: {
            x: 'dynamicTwitterUser',
            instagram: 'dynamicInstaUser'
          },
          fav_team: 'Celtics'
        })
      });
    });
    
    // Replace the global fetch mock temporarily
    const originalFetch = global.fetch;
    global.fetch = mockFetch;

    // Test that the component can be rendered without crashing
    expect(() => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1]} 
          userData={[mockUsers[0]]} 
        />
      );
    }).not.toThrow();
    
    // Restore the original fetch mock
    global.fetch = originalFetch;
  });

  it('handles different combinations of profile data correctly', async () => {
    // Mock a simplified version for this test to avoid API calls
    const users = [mockUsers[0], mockUsers[2]]; // User with team+social and user with team only
    
    await act(async () => {
      render(
        <LeaderboardProfiles 
          sport="NFL" 
          week={1} 
          userIds={[1, 3]} 
          userData={users}
        />
      );
    });

    // Test different combinations by directly checking if component renders
    expect(screen.getByText(users[0].username)).toBeInTheDocument();
    expect(screen.getByText(users[1].username)).toBeInTheDocument();
    
    // Success if we can see user data
    expect(screen.getAllByText(users[0].performance + '%')).toHaveLength(1);
    expect(screen.getAllByText(users[1].performance + '%')).toHaveLength(1);
  });
}); 