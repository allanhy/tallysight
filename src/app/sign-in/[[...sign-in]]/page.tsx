'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 items-center justify-center">
      {/* Header Text */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-black">Log in</h1>
        <p className="text-black mt-2 text-lg">Welcome back, let's play!</p>
      </header>

      {/* Sign-In Box */}
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="relative isolate w-full max-w-sm rounded-lg bg-white p-8 shadow-md ring-1 ring-gray-400"
        >
          {/* Google Sign-In */}
          <div className="space-y-5">
            <Clerk.Connection
              name="google"
              className="w-full flex items-center justify-center bg-black text-white py-3 rounded-lg text-base hover:bg-gray-800"
            >
              Continue with Google
            </Clerk.Connection>

            {/* Divider */}
            <div className="flex items-center space-x-4">
              <hr className="flex-grow border-t border-gray-400" />
              <p className="text-base text-gray-600">OR</p>
              <hr className="flex-grow border-t border-gray-400" />
            </div>

            {/* Email Field */}
            <Clerk.Field name="identifier" className="relative">
              <Clerk.Input
                type="email"
                required
                placeholder="Email"
                className="w-full border border-gray-400 rounded-lg px-5 py-3 text-base placeholder-gray-600 text-gray-800 outline-none focus:ring-2 focus:ring-gray-400 focus:placeholder-transparent"
              />
              <Clerk.FieldError className="mt-2 block text-sm text-rose-400" />
            </Clerk.Field>

            {/* Password Field */}
            <Clerk.Field name="password" className="relative">
              <Clerk.Input
                type="password"
                required
                placeholder="Password"
                className="w-full border border-gray-400 rounded-lg px-5 py-3 text-base placeholder-gray-600 text-gray-800 outline-none focus:ring-2 focus:ring-gray-400 focus:placeholder-transparent"
              />
              <Clerk.FieldError className="mt-2 block text-sm text-rose-400" />
            </Clerk.Field>

            {/* Forgot Password */}
            <a
              href="/forgot-password"
              className="text-blue-600 decoration-blue-600/30 underline-offset-4 text-sm hover:underline focus-visible:underline"
            >
              Forgot password?
            </a>

            {/* Sign-In Button from Old Code */}
            <SignIn.Action
              submit
              className="relative isolate w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-medium text-white shadow-[0_1px_0_0_theme(colors.white/30%)_inset,0_-1px_1px_0_theme(colors.black/5%)_inset] outline-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-blue-100 before:opacity-0 hover:before:opacity-100 transition-opacity duration-200 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-gray-800 active:bg-blue-700 active:text-gray-200"
            >
              Sign In
            </SignIn.Action>
          </div>
        </SignIn.Step>
      </SignIn.Root>

      {/* Footer below the box */}
      <p className="mt-6 text-center text-base text-black">
        Don't have an account?{' '}
        <a
          href="/sign-up"
          className="text-blue-600 decoration-blue-600/30 underline-offset-4 outline-none hover:underline focus-visible:underline"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}

