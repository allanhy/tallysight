import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignUpPage from '../../src/app/sign-up/[[...sign-up]]/page';
import ReCAPTCHA from 'react-google-recaptcha';

jest.mock('react-google-recaptcha', () => {
  return jest.fn(() => <div data-testid="recaptcha" />);
});

describe('SignUpPage', () => {
  it('renders reCAPTCHA component', () => {
    render(<SignUpPage />);
    
    // Check if the reCAPTCHA component is rendered
    const recaptchaElement = screen.getByTestId('recaptcha');
    expect(recaptchaElement).toBeInTheDocument();
  });

  it('handles reCAPTCHA token change', () => {
    const { getByTestId } = render(<SignUpPage />);
    
    // Simulate the reCAPTCHA token change
    const recaptcha = getByTestId('recaptcha');
    fireEvent.click(recaptcha); 
    
  });
});
