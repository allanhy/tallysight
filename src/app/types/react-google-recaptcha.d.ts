declare module 'react-google-recaptcha' {
  import React from 'react';

  interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (value: string | null) => void;
    
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {}
}
