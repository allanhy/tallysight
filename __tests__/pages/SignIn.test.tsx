import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInPage from '../../src/app/sign-in/[[...sign-in]]/page';
import * as clerkHooks from '@clerk/nextjs';

// Mock the Clerk hooks and components
jest.mock('@clerk/nextjs', () => ({
  useSignIn: jest.fn(),
  AuthenticateWithRedirectCallback: jest.fn(({ children }) => <div>{children}</div>)
}));

// Mock Clerk Elements
jest.mock('@clerk/elements/sign-in', () => ({
  Root: ({ children }) => <div data-testid="sign-in-root">{children}</div>,
  Step: ({ children, name }) => <div data-testid={`step-${name}`}>{children}</div>,
  Action: ({ children }) => <button>{children}</button>,
  Strategy: ({ children }) => <div>{children}</div>
}));

jest.mock('@clerk/elements/common', () => ({
  Field: ({ children, name }) => <div data-testid={`field-${name}`}>{children}</div>,
  Label: ({ children }) => <label>{children}</label>,
  Input: ({ type }) => <input type={type} data-testid={`input-${type}`} />,
  FieldError: () => null,
  GlobalError: () => null
}));

// Mock usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/sign-in')
}));

describe('SignInPage', () => {
  // Setup mock implementation for Clerk's useSignIn hook
  const mockSignIn = {
    authenticateWithRedirect: jest.fn().mockResolvedValue({}),
    isLoaded: true,
    setActive: jest.fn().mockResolvedValue({}),
    signIn: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (clerkHooks.useSignIn as jest.Mock).mockReturnValue({ signIn: mockSignIn });
  });

  it('renders without crashing', () => {
    expect(() => render(<SignInPage />)).not.toThrow();
  });

  it('renders the sign-in page with login text', () => {
    render(<SignInPage />);
    expect(document.body.textContent).toContain('Log in');
  });

  it('renders the Google sign-in button', () => {
    render(<SignInPage />);
    const buttons = screen.getAllByRole('button');
    const googleButton = Array.from(buttons).find(button => 
      button.textContent?.includes('Continue with Google')
    );
    expect(googleButton).toBeTruthy();
  });

  it('handles sign in with Google click', async () => {
    render(<SignInPage />);
    
    const buttons = screen.getAllByRole('button');
    const googleButton = Array.from(buttons).find(button => 
      button.textContent?.includes('Continue with Google')
    );
    
    if (googleButton) {
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockSignIn.authenticateWithRedirect).toHaveBeenCalledWith({
          strategy: 'oauth_google',
          redirectUrl: '/sign-in/sso-callback',
          redirectUrlComplete: '/',
        });
      });
    }
  });

  it('includes links in the sign-in page', () => {
    render(<SignInPage />);
    expect(document.body.innerHTML).toContain('href="/sign-up"');
    expect(document.body.innerHTML).toContain('href="/forgot-password"');
  });
}); 