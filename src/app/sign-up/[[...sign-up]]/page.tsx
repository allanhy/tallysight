'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignUp from '@clerk/elements/sign-up';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 items-center justify-center">
      {/* Header Text */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-black">Sign up</h1>
        <p className="text-black mt-2 text-lg">Never miss out on the action.</p>
      </header>

      {/* Sign-Up Box */}
      <SignUp.Root>
        <SignUp.Step
          name="start"
          className="relative isolate w-full max-w-sm rounded-lg bg-white p-8 shadow-md ring-1 ring-gray-400"
        >
          {/* Google Sign-Up */}
          <div className="space-y-5">
            <Clerk.Connection
              name="google"
              className="w-full flex items-center justify-center bg-black text-white py-3 rounded-lg text-base hover:bg-gray-800"
            >
              Sign up with Google
            </Clerk.Connection>

            {/* Divider */}
            <div className="flex items-center space-x-4">
              <hr className="flex-grow border-t border-gray-400" />
              <p className="text-base text-gray-600">OR</p>
              <hr className="flex-grow border-t border-gray-400" />
            </div>

            {/* Handle Field */}
            <Clerk.Field name="handle" className="relative">
              <Clerk.Input
                type="text"
                required
                placeholder="Handle"
                className="w-full border border-gray-400 rounded-lg px-5 py-3 text-base placeholder-gray-600 text-gray-800 outline-none focus:ring-2 focus:ring-gray-400"
              />
            </Clerk.Field>

            {/* Name Field */}
            <Clerk.Field name="name" className="relative">
              <Clerk.Input
                type="text"
                required
                placeholder="Name"
                className="w-full border border-gray-400 rounded-lg px-5 py-3 text-base placeholder-gray-600 text-gray-800 outline-none focus:ring-2 focus:ring-gray-400"
              />
            </Clerk.Field>

            {/* Email Field */}
            <Clerk.Field name="emailAddress" className="relative">
              <Clerk.Input
                type="email"
                required
                placeholder="Email"
                className="w-full border border-gray-400 rounded-lg px-5 py-3 text-base placeholder-gray-600 text-gray-800 outline-none focus:ring-2 focus:ring-gray-400"
              />
            </Clerk.Field>

            {/* Password Field */}
            <Clerk.Field name="password" className="relative">
              <Clerk.Input
                type="password"
                required
                placeholder="Password"
                className="w-full border border-gray-400 rounded-lg px-5 py-3 text-base placeholder-gray-600 text-gray-800 outline-none focus:ring-2 focus:ring-gray-400"
              />
            </Clerk.Field>

            {/* Play Now Button */}
            <SignUp.Action
              submit
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-base hover:bg-blue-500 focus:ring-2 focus:ring-blue-300"
            >
              Play Now
            </SignUp.Action>
          </div>
        </SignUp.Step>
      </SignUp.Root>

      {/* Footer below the box */}
      <p className="mt-6 text-center text-base text-black">
        Already have an account?{' '}
        <a
          href="/sign-in"
          className="text-blue-600 decoration-blue-600/30 underline-offset-4 outline-none hover:underline focus-visible:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
