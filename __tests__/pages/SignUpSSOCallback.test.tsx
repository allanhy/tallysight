import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpPage from '../../src/app/sign-up/[[...sign-up]]/page';
import * as clerkHooks from '@clerk/nextjs';

// Mock the Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useSignUp: jest.fn(),
  AuthenticateWithRedirectCallback: jest.fn(() => <div data-testid="auth-callback">SSO Callback</div>)
}));

// Mock Clerk Elements
jest.mock('@clerk/elements/sign-up', () => ({
  Root: ({ children }) => <div data-testid="sign-up-root">{children}</div>,
  Step: ({ children }) => <div data-testid="sign-up-step">{children}</div>,
  Action: ({ children }) => <button>{children}</button>,
  Strategy: ({ children }) => <div>{children}</div>
}));

jest.mock('@clerk/elements/common', () => ({
  Field: ({ children }) => <div>{children}</div>,
  Label: ({ children }) => <label>{children}</label>,
  Input: () => <input aria-label="test-input" />,
  FieldError: () => null,
  GlobalError: () => null
}));

// Mock usePathname hook to simulate SSO callback path
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/sign-up/sso-callback')
}));

// Mock the Skeleton component
jest.mock('@/app/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>
}));

describe('SignUpPage SSO Callback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (clerkHooks.useSignUp as jest.Mock).mockReturnValue({ signUp: {} });
  });

  it('renders without crashing', () => {
    expect(() => render(<SignUpPage />)).not.toThrow();
  });

  it('renders the AuthenticateWithRedirectCallback component', () => {
    render(<SignUpPage />);
    
    // Check for the authentication callback content
    expect(document.body.innerHTML).toContain('SSO Callback');
  });

  it('renders loading UI during SSO callback', () => {
    render(<SignUpPage />);
    
    // Check for loading indicators
    const skeleton = document.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toBeTruthy();
  });
}); 