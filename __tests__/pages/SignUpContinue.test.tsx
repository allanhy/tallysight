import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpContinuePage from '../../src/app/sign-up/continue/page';
import * as clerkHooks from '@clerk/nextjs';

// Mock the Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useSignUp: jest.fn(),
  useUser: jest.fn()
}));

// Mock the Skeleton component
jest.mock('@/app/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    back: jest.fn()
  })
}));

describe('SignUpContinuePage', () => {
  // Setup mock implementation for Clerk's useSignUp hook
  const mockSignUp = {
    isLoaded: true,
    setActive: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    signUp: {
      username: null,
      firstName: 'Test',
      lastName: 'User'
    }
  };

  const mockUser = {
    isLoaded: true,
    isSignedIn: true,
    user: {
      fullName: 'Test User',
      username: null
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (clerkHooks.useSignUp as jest.Mock).mockReturnValue(mockSignUp);
    (clerkHooks.useUser as jest.Mock).mockReturnValue(mockUser);
  });

  it('renders without crashing', () => {
    expect(() => render(<SignUpContinuePage />)).not.toThrow();
  });

  it('renders the username selection page', () => {
    render(<SignUpContinuePage />);
    expect(document.body.textContent).toContain('Choose your username');
  });

  it('shows welcome message with user name', () => {
    render(<SignUpContinuePage />);
    expect(document.body.textContent).toContain('Test User');
  });

  it('renders form with username field', () => {
    render(<SignUpContinuePage />);
    
    // Look for form elements
    const usernameInputs = Array.from(document.querySelectorAll('input')).filter(input => 
      input.id === 'username' || input.name === 'username' || input.placeholder?.includes('username')
    );
    
    expect(usernameInputs.length).toBeGreaterThan(0);
  });

  it('includes a continue button', () => {
    render(<SignUpContinuePage />);
    
    const buttons = screen.getAllByRole('button');
    const continueButton = Array.from(buttons).find(button => 
      button.textContent?.includes('Continue') || 
      button.textContent?.includes('Submit') ||
      button.textContent?.includes('Save')
    );
    
    expect(continueButton).toBeTruthy();
  });
}); 