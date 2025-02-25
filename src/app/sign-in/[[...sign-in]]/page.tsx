/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React from 'react';
import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { AuthenticateWithRedirectCallback, useSignIn } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types'
import { usePathname } from 'next/navigation';

export default function SignInPage() {
  const { signIn } = useSignIn()
  const pathname = usePathname();
  const isSSOCallback = pathname.includes('sso-callback');

  if (isSSOCallback) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className='text-black'>Please Wait...</p>
        {/* The Clerk component that finishes the OAuth flow */}
        <AuthenticateWithRedirectCallback continueSignUpUrl="/sign-up/continue" />
      </div>
    );
  }

  if (!signIn) return null

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-white dark:bg-black">
      <div className="w-full flex justify-center flex-col items-center">
        <header className="text-center w-full mb-4">
          <div className="text-3xl font-extrabold text-black dark:text-white">
            Log in
          </div>
          <h1 className="mt-4 text-xl font-medium tracking-tight text-gray-700 dark:text-gray-300">
            Welcome back, let&apos;s play!
          </h1>
        </header>

        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="relative isolate w-full space-y-6 rounded-2xl bg-white px-8 py-8 shadow-md border-[1px] border-gray-400 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-50 sm:w-[550px] sm:px-10"
          >
            <Clerk.GlobalError className="block text-sm text-rose-400" />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => signInWith("oauth_google")}
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
                Continue with Google
              </button>
            </div>


            <div className="flex items-center space-x-2">
              <hr className="flex-grow border-t border-gray-300" />
              <p className="text-sm font-medium text-gray-400">OR</p>
              <hr className="flex-grow border-t border-gray-300" />
            </div>

            <Clerk.Field name="identifier" className="group/field relative">
              <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                Email address
              </Clerk.Label>
              <Clerk.Input
                type="text"
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

            <a
              href="/forgot-password"
              className="text-blue-600 decoration-blue-600/30 underline-offset-4 outline-none hover:underline focus-visible:underline"
            >
              Forgot password?
            </a>

            <SignIn.Action
              submit
              className="relative isolate w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-bold text-white shadow-[0_1px_0_0_theme(colors.white/30%)_inset,0_-1px_1px_0_theme(colors.black/5%)_inset] outline-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-blue-100 before:opacity-0 hover:before:opacity-100 transition-opacity duration-200 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-gray-800 active:bg-blue-700 active:text-gray-200"
            >
              Log in
            </SignIn.Action>

            <div className="text-center text-sm text-gray-600 w-full mt-6">
              <span className="font-bold">Don&apos;t have an account?</span>{' '}
              <a
                href="/sign-up"
                className="text-blue-600 underline decoration-blue-600/30 underline-offset-4 outline-none hover:underline focus-visible:underline font-medium"
              >
                Sign up
              </a>
            </div>
          </SignIn.Step>

          <SignIn.Step name="verifications" className="relative isolate w-full space-y-8 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-inset ring-gray-300 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-50 sm:w-96 sm:px-8">
            <header className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 40 40"
                className="mx-auto size-10"
              >
                <mask id="a" width="40" height="40" x="0" y="0" maskUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="20" fill="#D9D9D9" />
                </mask>
                <g fill="#34D399" mask="url(#a)">
                  <path d="M43.5 3a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46V2ZM43.5 8a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46V7ZM43.5 13a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46v-1ZM43.5 18a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46v-1ZM43.5 23a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46v-1ZM43.5 28a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46v-1ZM43.5 33a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46v-1ZM43.5 38a.5.5 0 0 0 0-1v1Zm0-1h-46v1h46v-1Z" />
                  <path d="M27 3.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2ZM25 8.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2ZM23 13.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2ZM21.5 18.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2ZM20.5 23.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2ZM22.5 28.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2ZM25 33.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2ZM27 38.5a1 1 0 1 0 0-2v2Zm0-2h-46v2h46v-2Z" />
                </g>
              </svg>
              <h1 className="mt-4 text-xl font-medium tracking-tight text-gray-800">
                Verify phone code
              </h1>
            </header>
            <Clerk.GlobalError className="block text-sm text-rose-400" />
            <SignIn.Strategy name="phone_code">
              <Clerk.Field name="code" className="group/field relative">
                <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Phone code
                </Clerk.Label>
                <Clerk.Input
                  type="otp"
                  required
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
                />
                <Clerk.FieldError className="mt-2 block text-xs text-rose-400" />
              </Clerk.Field>
              <SignIn.Action
                submit
                className="relative isolate w-full rounded-lg bg-gradient-to-b from-blue-200 to-blue-300 px-3.5 py-2.5 text-center text-sm font-medium text-gray-800 shadow-[0_1px_0_0_theme(colors.white/30%)_inset,0_-1px_1px_0_theme(colors.black/5%)_inset] outline-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-blue-100 before:opacity-0 hover:before:opacity-100 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-gray-800 active:text-gray-800/80 active:before:bg-black/10"
              >
                Continue
              </SignIn.Action>
            </SignIn.Strategy>
            <p className="text-center text-sm text-gray-600">
              <span className="font-bold">Don&apos;t have an account?</span>{' '}
              <a
                href="#"
                className="text-blue-600 decoration-blue-600/30 underline-offset-4 outline-none hover:underline focus-visible:underline"
              >
                Create an account
              </a>
            </p>
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </div>
  )
}
