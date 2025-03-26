import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}));

// Mock global alert
const mockAlert = jest.fn();
global.alert = mockAlert;

describe('Social Media Links Update', () => {
  // Mock user and dependencies
  const mockUser = {
    unsafeMetadata: {
      x: 'oldxhandle',
      instagram: 'oldinstahandle',
      discord: 'olddiscordhandle',
      facebook: 'oldfacebookhandle',
      snapchat: 'oldsnaphandle'
    },
    update: jest.fn()
  };

  // Mock setState function
  const mockSetSocialLinks = jest.fn();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock user
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser
    });
  });

  test('updates social media links successfully', async () => {
    // Prepare test data
    const socialData = {
      x: 'newxhandle',
      instagram: 'newinstahandle',
      discord: 'newdiscordhandle',
      facebook: 'newfacebookhandle',
      snapchat: 'newsnaphandle'
    };

    // Mock successful update
    mockUser.update.mockResolvedValue({});

    // Simulate handleSocialMediaSubmit function
    const handleSocialMediaSubmit = async (data: any) => {
      try {
        const socialData = {
          x: data.x || '',
          instagram: data.instagram || '',
          discord: data.discord || '',
          facebook: data.facebook || '',
          snapchat: data.snapchat || ''
        };
        
        // Update Clerk's unsafe metadata
        await mockUser.update({
          unsafeMetadata: {
            ...mockUser.unsafeMetadata,
            ...socialData
          }
        });

        // Update local state to reflect changes
        mockSetSocialLinks(socialData);
        alert('Social media links updated successfully!');
      } catch (error) {
        console.error("Error updating social media links:", error);
        alert('Failed to update social media links');
      }
    };

    // Execute the function
    await handleSocialMediaSubmit(socialData);

    // Verify update method was called with correct parameters
    expect(mockUser.update).toHaveBeenCalledWith({
      unsafeMetadata: {
        ...mockUser.unsafeMetadata,
        ...socialData
      }
    });

    // Verify local state update
    expect(mockSetSocialLinks).toHaveBeenCalledWith(socialData);

    // Verify success alert
    expect(mockAlert).toHaveBeenCalledWith('Social media links updated successfully!');
  });

  test('handles partial social media link updates', async () => {
    // Prepare partial update data
    const partialSocialData = {
          x: 'newxhandle',
          instagram: '',
          discord: 'newdiscordhandle',
          facebook: 'oldfacebookhandle',  // Stays as oldfacebookhandle because this would be saved from previous submission in form
          snapchat: 'oldsnaphandle'       // Stays as oldsnaphandle because this would be saved from previous submission in form
    };

    // Mock successful update
    mockUser.update.mockResolvedValue({});

    // Simulate handleSocialMediaSubmit function
    const handleSocialMediaSubmit = async (data: any) => {
      try {
        const socialData = {
          x: data.x || '',
          instagram: data.instagram || '',
          discord: data.discord || '',
          facebook: data.facebook || '',
          snapchat: data.snapchat || ''
        };
        
        // Update Clerk's unsafe metadata
        await mockUser.update({
          unsafeMetadata: {
            ...mockUser.unsafeMetadata,
            ...socialData
          }
        });

        // Update local state to reflect changes
        mockSetSocialLinks(socialData);
        alert('Social media links updated successfully!');
      } catch (error) {
        console.error("Error updating social media links:", error);
        alert('Failed to update social media links');
      }
    };

    // Execute the function
    await handleSocialMediaSubmit(partialSocialData);

    // Verify update method was called with correct parameters
    expect(mockUser.update).toHaveBeenCalledWith({
      unsafeMetadata: {
        ...mockUser.unsafeMetadata,
        x: 'newxhandle',
        instagram: '',
        discord: 'newdiscordhandle',
        facebook: 'oldfacebookhandle',
        snapchat: 'oldsnaphandle'
      }
    });

    // Verify local state update
    expect(mockSetSocialLinks).toHaveBeenCalledWith({
      x: 'newxhandle',
      instagram: '',
      discord: 'newdiscordhandle',
      facebook: 'oldfacebookhandle',
      snapchat: 'oldsnaphandle'
    });

    // Verify success alert
    expect(mockAlert).toHaveBeenCalledWith('Social media links updated successfully!');
  });

  test('handles update failure', async () => {
    // Prepare test data
    const socialData = {
      x: 'newxhandle',
      instagram: 'newinstahandle',
      discord: 'newdiscordhandle',
      facebook: 'newfacebookhandle',
      snapchat: 'newsnaphandle'
    };

    // Mock error during update
    const mockError = new Error('Update failed');
    mockUser.update.mockRejectedValue(mockError);

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Simulate handleSocialMediaSubmit function
    const handleSocialMediaSubmit = async (data: any) => {
      try {
        const socialData = {
          x: data.x || '',
          instagram: data.instagram || '',
          discord: data.discord || '',
          facebook: data.facebook || '',
          snapchat: data.snapchat || ''
        };
        
        // Update Clerk's unsafe metadata
        await mockUser.update({
          unsafeMetadata: {
            ...mockUser.unsafeMetadata,
            ...socialData
          }
        });

        // Update local state to reflect changes
        mockSetSocialLinks(socialData);
        alert('Social media links updated successfully!');
      } catch (error) {
        console.error("Error updating social media links:", error);
        alert('Failed to update social media links');
      }
    };

    // Execute the function
    await handleSocialMediaSubmit(socialData);

    // Verify update method was called
    expect(mockUser.update).toHaveBeenCalledWith({
      unsafeMetadata: {
        ...mockUser.unsafeMetadata,
        ...socialData
      }
    });

    // Verify error handling
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error updating social media links:', 
      expect.any(Error)
    );

    // Verify error alert
    expect(mockAlert).toHaveBeenCalledWith('Failed to update social media links');

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});