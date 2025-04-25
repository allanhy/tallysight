import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInPage from '../../src/app/sign-in/[[...sign-in]]/page';
import * as clerkHooks from '@clerk/nextjs';

// Mock the Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useSignIn: jest.fn(),
  AuthenticateWithRedirectCallback: jest.fn(() => <div data-testid="auth-callback">SSO Callback</div>)
}));

// Mock Clerk Elements
jest.mock('@clerk/elements/sign-in', () => ({
  Root: ({ children }) => <div data-testid="sign-in-root">{children}</div>,
  Step: ({ children }) => <div data-testid="sign-in-step">{children}</div>,
  Action: ({ children }) => <button>{children}</button>,
  Strategy: ({ children }) => <div>{children}</div>
}));

jest.mock('@clerk/elements/common', () => ({
  Field: ({ children }) => <div>{children}</div>,
  Label: ({ children }) => <label>{children}</label>,
  Input: () => <input />,
  FieldError: () => null,
  GlobalError: () => null
}));

// Mock usePathname hook to simulate SSO callback path
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/sign-in/sso-callback')
}));

// Mock the Skeleton component
jest.mock('@/app/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>
}));

describe('SignInPage SSO Callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (clerkHooks.useSignIn as jest.Mock).mockReturnValue({ signIn: {} });
  });

  it('renders without crashing', () => {
    expect(() => render(<SignInPage />)).not.toThrow();
  });

  it('renders the AuthenticateWithRedirectCallback component', () => {
    render(<SignInPage />);
    
    // Check for the authentication callback content
    expect(document.body.innerHTML).toContain('SSO Callback');
  });

  it('shows continue sign up text', () => {
    render(<SignInPage />);
    expect(document.body.textContent).toContain('Continue Sign Up');
  });

  it('shows loading UI during SSO callback', () => {
    render(<SignInPage />);
    expect(document.body.textContent).toContain('Please choose your username');
  });
}); 