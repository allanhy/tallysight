import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpPage from '../../src/app/sign-up/[[...sign-up]]/page';
import * as clerkHooks from '@clerk/nextjs';

// Mock the Clerk hooks and components
jest.mock('@clerk/nextjs', () => ({
  useSignUp: jest.fn(),
  AuthenticateWithRedirectCallback: jest.fn(({ children }) => <div>{children}</div>)
}));

// Mock Clerk Elements
jest.mock('@clerk/elements/sign-up', () => ({
  Root: ({ children }) => <div data-testid="sign-up-root">{children}</div>,
  Step: ({ children, name }) => <div data-testid={`step-${name}`}>{children}</div>,
  Action: ({ children }) => <button>{children}</button>,
  Strategy: ({ children }) => <div>{children}</div>
}));

jest.mock('@clerk/elements/common', () => ({
  Field: ({ children, name }) => <div data-testid={`field-${name}`}>{children}</div>,
  Label: ({ children }) => <label>{children}</label>,
  Input: ({ type }) => <input type={type} data-testid={`input-${type}`} aria-label={type} />,
  FieldError: () => null,
  GlobalError: () => null
}));

// Mock usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/sign-up')
}));

describe('SignUpPage', () => {
  // Setup mock implementation for Clerk's useSignUp hook
  const mockSignUp = {
    authenticateWithRedirect: jest.fn().mockResolvedValue({}),
    isLoaded: true,
    setActive: jest.fn().mockResolvedValue({}),
    signUp: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (clerkHooks.useSignUp as jest.Mock).mockReturnValue({ signUp: mockSignUp });
  });

  it('renders without crashing', () => {
    expect(() => render(<SignUpPage />)).not.toThrow();
  });

  it('renders the sign-up page with registration text', () => {
    render(<SignUpPage />);
    expect(document.body.textContent).toContain('Create an account');
  });

  it('renders the Google sign-up button', () => {
    render(<SignUpPage />);
    const buttons = screen.getAllByRole('button');
    const googleButton = Array.from(buttons).find(button => 
      button.textContent?.includes('Continue with Google')
    );
    expect(googleButton).toBeTruthy();
  });

  it('handles sign up with Google click', async () => {
    render(<SignUpPage />);
    
    const buttons = screen.getAllByRole('button');
    const googleButton = Array.from(buttons).find(button => 
      button.textContent?.includes('Continue with Google')
    );
    
    if (googleButton) {
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockSignUp.authenticateWithRedirect).toHaveBeenCalledWith(
          expect.objectContaining({
            strategy: 'oauth_google',
          })
        );
      });
    }
  });

  it('includes link to sign in page', () => {
    render(<SignUpPage />);
    expect(document.body.innerHTML).toContain('href="/sign-in"');
  });
}); 