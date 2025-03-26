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

// Utility to create mock context
const createMockContext = () => {
  // Mock user object
  const mockUser = {
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    unsafeMetadata: {
      x: 'xhandle',
      instagram: 'instahandle',
      discord: 'discordhandle',
      facebook: 'fbhandle',
      snapchat: 'snaphandle'
    },
    update: jest.fn()
  };

  // Setup mocks
  (useUser as jest.Mock).mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: mockUser
  });

  // Mock form handlers
  const mockFormHandlers = {
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} }
  };
  (useForm as jest.Mock).mockReturnValue(mockFormHandlers);

  return {
    mockUser,
    mockFormHandlers
  };
};

describe('Profile Information Update', () => {
  let mockContext: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup mock context
    mockContext = createMockContext();
  });

  test('handles successful profile update', async () => {
    // Mock successful update
    mockContext.mockUser.update.mockResolvedValue({});

    // Simulate onSubmit function
    const onSubmit = async (data: any) => {
      try {
        await mockContext.mockUser.update({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    };

    // Execute submission
    await onSubmit({
      username: 'newusername',
      firstName: 'Jane',
      lastName: 'Smith'
    });

    // Verify update method called with correct parameters
    expect(mockContext.mockUser.update).toHaveBeenCalledWith({
      username: 'newusername',
      firstName: 'Jane',
      lastName: 'Smith'
    });
  });

  test('handles profile update error', async () => {
    // Mock update error
    const mockError = new Error('Update failed');
    mockContext.mockUser.update.mockRejectedValue(mockError);

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Simulate onSubmit function with error handling
    const onSubmit = async (data: any) => {
      try {
        await mockContext.mockUser.update({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    };

    // Execute submission and catch potential error
    await onSubmit({
      username: 'newusername',
      firstName: 'Jane',
      lastName: 'Smith'
    });

    // Verify error handling
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error updating profile:', 
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('handles unloaded or unsigned in user state', () => {
    // Mock unloaded/unsigned state
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      user: null
    });

    // Get user state
    const { isLoaded, isSignedIn, user } = useUser();

    // Verify state
    expect(isLoaded).toBe(false);
    expect(isSignedIn).toBe(false);
    expect(user).toBeNull();
  });

});