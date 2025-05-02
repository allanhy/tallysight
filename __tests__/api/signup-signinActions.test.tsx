/**
 * @jest-environment node
 */
jest.mock('@clerk/nextjs', () => ({
  useSignIn: () => ({
    signIn: {
      authenticateWithRedirect: jest.fn().mockResolvedValue({ success: true }),
    },
  }),
  useSignUp: () => ({
    signUp: {
      authenticateWithRedirect: jest.fn().mockResolvedValue({ success: true }),
    },
  }),
}));

import { useSignIn, useSignUp } from '@clerk/nextjs';

describe('Clerk SignIn/SignUp Trigger Test', () => {
  it('should call signIn.authenticateWithRedirect when triggered', async () => {
    const { signIn } = useSignIn();
    const result = await signIn!.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sign-in/sso-callback',
      redirectUrlComplete: '/',
    });

    expect(signIn!.authenticateWithRedirect).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('should call signUp.authenticateWithRedirect when triggered', async () => {
    const { signUp } = useSignUp();
    const result = await signUp!.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sign-up/sso-callback',
      redirectUrlComplete: '/',
    });

    expect(signUp!.authenticateWithRedirect).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });
});
