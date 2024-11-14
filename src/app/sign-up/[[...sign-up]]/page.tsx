'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'

export default function SignUpPage() {
  return (
    <div className="relative grid w-full flex-grow items-center bg-black px-4 sm:justify-center">
      <SignUp.Root>
        <SignUp.Step
          name="start"
          className="relative isolate w-full space-y-8 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-inset ring-gray-300 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-50 sm:w-96 sm:px-8"
        >
          <header className="text-center">
          <div className='text-3xl font-bold italic text-blue-600 uppercase'>
              TALLYSIGHT
            </div>
            <h1 className="mt-4 text-xl font-medium tracking-tight text-gray-800">
              Create an account
            </h1>
          </header>
          <Clerk.GlobalError className="block text-sm text-rose-400" />
          <div className="space-y-4">
            {/* Username Field */}
            <Clerk.Field name="username" className="group/field relative">
              <Clerk.Label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                Username
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
          <SignUp.Action
            submit
            className="relative isolate w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-medium text-white shadow-[0_1px_0_0_theme(colors.white/30%)_inset,0_-1px_1px_0_theme(colors.black/5%)_inset] outline-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-blue-100 before:opacity-0 hover:before:opacity-100 transition-opacity duration-200 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-gray-800 active:bg-blue-700 active:text-gray-200"
          >
            Sign Up
          </SignUp.Action>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/sign-in"
              className="text-blue-600 decoration-blue-600/30 underline-offset-4 outline-none hover:underline focus-visible:underline"
            >
              Sign in
            </a>
          </p>
        </SignUp.Step>
        <SignUp.Step
          name="verifications"
          className="relative isolate w-full space-y-8 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-inset ring-gray-300 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-50 sm:w-96 sm:px-8"
        >
          <header className="text-center">
            <div className='text-3xl font-bold italic text-blue-600 uppercase'>
              TALLYSIGHT
            </div>
            <h1 className="mt-4 text-xl font-medium tracking-tight text-gray-800">
              Verify email code
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
  )
}
