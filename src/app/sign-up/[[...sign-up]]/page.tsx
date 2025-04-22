/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react';
import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { AuthenticateWithRedirectCallback, useSignUp } from '@clerk/nextjs';
import { useParams, usePathname } from 'next/navigation';
import { Skeleton } from '@/app/components/ui/skeleton';
import { OAuthStrategy } from '@clerk/types'


export default function SignUpPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaVerified, setRecaptchaVerified] = useState<boolean>(false);
  const pathname = usePathname();
  const isSSOCallback = pathname.includes('sso-callback');
  const { signUp } = useSignUp()


  if (isSSOCallback) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <header className="text-center w-full mb-4">
  <div className="text-3xl font-extrabold text-black dark:text-white">
    Just a moment…
  </div>
  <h1 className="mt-2 text-xl font-medium tracking-tight text-gray-700 dark:text-gray-300">
    We're verifying your account.
  </h1>
</header>
        {/* The Clerk component that finishes the OAuth flow */}
        <AuthenticateWithRedirectCallback continueSignUpUrl="/sign-up/continue" />
      </div>
    );
  }

  if (!signUp) return null

  const signUpWith = (strategy: OAuthStrategy) => {
    return signUp
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: '/',
      })
      .then((res) => {
        console.log(res)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.log(err.errors)
        console.error(err, null, 2)
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    // Send the recaptchaToken to your server
    try {
      const response = await axios.post('http://localhost:3000/api/sign-up', { recaptchaToken });
      alert(response.data.message);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 pt-6 pb-6">
      <div className="w-full flex justify-center flex-col items-center">
        <header className="text-center w-full mb-4">
          <div className='text-3xl font-extrabold text-black dark:text-white'>
            Sign up
          </div>
          <h1 className="mt-2 text-xl font-medium tracking-tight text-gray-700 dark:text-gray-300">
            Never miss out on the action.
          </h1>
        </header>

        <SignUp.Root>
          <SignUp.Step
            name="start"
            className="relative isolate w-full space-y-6 rounded-2xl bg-white px-8 py-8 shadow-md border-[1px] border-gray-400 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-50 sm:w-[550px] sm:px-10"
          >
            <Clerk.GlobalError className="block text-sm text-rose-400" />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => signUpWith("oauth_google")}
                className="flex w-full items-center justify-center gap-x-3 
                  rounded-md bg-black px-3.5 py-1.5 text-sm font-medium text-white 
                  shadow-[0_1px_0_0_theme(colors.white/5%)_inset,0_0_0_1px_theme(colors.white/2%)_inset] 
                  outline-none hover:bg-gray-800 focus-visible:outline-[1.5px] 
                  focus-visible:outline-offset-2 focus-visible:outline-white 
                  active:bg-gray-900 active:text-white/70"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 16"
                  className="w-4"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M8.82 7.28v2.187h5.227c-.16 1.226-.57 2.124-1.192 2.755-.764.765-1.955 1.6-4.035 1.6-3.218 0-5.733-2.595-5.733-5.813 0-3.218 2.515-5.814 5.733-5.814 1.733 0 3.005.685 3.938 1.565l1.538-1.538C12.998.96 11.256 0 8.82 0 4.41 0 .705 3.591.705 8s3.706 8 8.115 8c2.382 0 4.178-.782 5.582-2.24 1.44-1.44 1.893-3.475 1.893-5.111 0-.507-.035-.978-.115-1.369H8.82Z"
                  />
                </svg>
                Sign up with Google
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <hr className="flex-grow border-t border-gray-300" />
              <p className="text-sm font-medium text-gray-400">OR</p>
              <hr className="flex-grow border-t border-gray-300" />
            </div>

            <div className="space-y-4">
              {/* Username Field */}
              <Clerk.Field name="username" className="group/field relative">
                <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Handle
                </Clerk.Label>
                <Clerk.Input
                  type="text"
                  required
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
                />
                <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
              </Clerk.Field>
              {/* First Name Field */}
              <Clerk.Field name="firstName" className="group/field relative">
                <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  First Name
                </Clerk.Label>
                <Clerk.Input
                  type="text"
                  required
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
                />
                <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
              </Clerk.Field>
              {/* Last Name Field */}
              <Clerk.Field name="lastName" className="group/field relative">
                <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Last Name
                </Clerk.Label>
                <Clerk.Input
                  type="text"
                  required
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
                />
                <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
              </Clerk.Field>
              <Clerk.Field name="emailAddress" className="group/field relative">
                <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Email
                </Clerk.Label>
                <Clerk.Input
                  type="email"
                  required
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
                />
                <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
              </Clerk.Field>
              <Clerk.Field name="password" className="group/field relative">
                <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Password
                </Clerk.Label>
                <Clerk.Input
                  type="password"
                  required
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
                />
                <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
              </Clerk.Field>
            </div>
            <ReCAPTCHA
              sitekey="6LfmD9AqAAAAAEOUXYEpH539_o9DGUS4b4YjkQYj"
              onChange={(token: string | null) => {
                if (!token) {
                  // Treat this as "expired"
                  setRecaptchaToken(null);
                  setRecaptchaVerified(false);
                  return;
                }
                // Otherwise, the token is valid
                setRecaptchaToken(token);
                setRecaptchaVerified(true);
              }}
            />
            <SignUp.Action
              submit
              disabled={!recaptchaVerified}
              className={`relative isolate w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-medium text-white ${!recaptchaVerified ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              Play Now
            </SignUp.Action>

            <div className="text-center text-sm text-gray-600 w-full mt-6">
              <span className="font-bold">Already have an account?</span>{' '}
              <a
                href="/sign-in"
                className="text-blue-600 underline decoration-blue-600/30 underline-offset-4 outline-none hover:underline focus-visible:underline font-medium"
              >
                Log in
              </a>
            </div>
          </SignUp.Step>

          <SignUp.Step name="continue">
            <Clerk.Field name="username" className="group/field relative">
              <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600">
                Username
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600"
              />
              <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
            </Clerk.Field>

            <SignUp.Action submit>Continue</SignUp.Action>
          </SignUp.Step>

          <SignUp.Step
            name="verifications"
            className="relative isolate w-full space-y-6 rounded-2xl bg-white px-8 py-8 shadow-md border-[1px] border-gray-400 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-50 sm:w-[550px] sm:px-10"
          >
            <header className="text-center">
              <div className='text-2xl font-bold text-black'>
                Verify email code
              </div>
              <h1 className="mt-4 text-l font-medium tracking-tight text-gray-800">
                Enter the code that was sent to your email address.
              </h1>
            </header>
            <Clerk.GlobalError className="block text-sm text-rose-400" />
            <SignUp.Strategy name="email_code">
              <Clerk.Field name="code" className="group/field relative">
                <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Verification Code
                </Clerk.Label>
                <Clerk.Input
                  type="text"
                  required
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
                />
                <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
              </Clerk.Field>
            </SignUp.Strategy>
            <SignUp.Action
              submit
              className="relative isolate w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-medium text-white shadow-[0_1px_0_0_theme(colors.white/30%)_inset,0_-1px_1px_0_theme(colors.black/5%)_inset] outline-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-blue-100 before:opacity-0 hover:before:opacity-100 transition-opacity duration-200 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-gray-800 active:bg-blue-700 active:text-gray-200"
            >
              Verify
            </SignUp.Action>
          </SignUp.Step>
        </SignUp.Root>
      </div>
    </div>
  )
}
