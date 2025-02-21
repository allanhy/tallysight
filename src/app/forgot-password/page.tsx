'use client'

import React, { useState } from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'


const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [secondFactor, setSecondFactor] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()

  if (!isLoaded) {
    return null
  }

  // If the user is already signed in,
  // redirect them to the home page
  if (isSignedIn) {
    router.push('/')
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault()
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((_) => {
        setSuccessfulCreation(true)
        setError('')
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage)
        setError(err.errors[0].longMessage)
      })
  }

  // Reset the user's password.
  // Upon successful reset, the user will be
  // signed in and redirected to the home page
  async function reset(e: React.FormEvent) {
    e.preventDefault()
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        // Check if 2FA is required
        if (result.status === 'needs_second_factor') {
          setSecondFactor(true)
          setError('')
        } else if (result.status === 'complete') {
          // Set the active session to
          // the newly created session (user is now signed in)
          setActive({ session: result.createdSessionId })
          //router.push('/sign-in')
          setError('')
        } else {
          console.log(result)
        }
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage)
        setError(err.errors[0].longMessage)
      })
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-white dark:bg-black">
      <header className="text-center">
        <div className='text-3xl font-extrabold pb-10 text-black dark:text-white'>
          Forgot Password?
        </div>
      </header>
      <div className="relative isolate w-full space-y-6 rounded-2xl bg-white px-8 py-8 shadow-md border-[1px] border-gray-400 sm:w-[550px] sm:px-10">
        <header className="text-center">
          <div className='text-2xl font-bold text-black'>
            Reset your password
          </div>
          <h1 className="mt-4 text-l font-medium tracking-tight text-gray-800">
            Please enter your email address.
          </h1>
        </header>
        <form
          onSubmit={!successfulCreation ? create : reset}
        >
          {!successfulCreation && (
            <>
              <label htmlFor="email">
                <h3 className="absolute left-10 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Email address
                </h3>
              </label>
              <input
                type="email"
                placeholder="e.g john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
              />
              <section className="pt-5">
                <button className="relative isolate w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-medium text-white shadow-[0_1px_0_0_theme(colors.white/30%)_inset,0_-1px_1px_0_theme(colors.black/5%)_inset] outline-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-blue-100 before:opacity-0 hover:before:opacity-100 transition-opacity duration-200 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-gray-800 active:bg-blue-700 active:text-gray-200">
                  Send code
                </button>
                {error && <p>{error}</p>}
              </section>
            </>
          )}

          {successfulCreation && (
            <>
              <div className="relative grid w-full flex-grow items-center px-4 sm:justify-center">
                <label
                  htmlFor="password"
                  className="text-left px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Enter your new password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400" />
                <label
                  htmlFor="password"
                  className="pt-5 text-left px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                  Enter the password reset code that was sent to your email
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400" />
                <section className="pt-5">
                  <button className="relative isolate w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-medium text-white shadow-[0_1px_0_0_theme(colors.white/30%)_inset,0_-1px_1px_0_theme(colors.black/5%)_inset] outline-none before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-blue-100 before:opacity-0 hover:before:opacity-100 transition-opacity duration-200 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-gray-800 active:bg-blue-700 active:text-gray-200">
                    Reset
                  </button>
                </section>
                {error && <p>{error}</p>}
              </div>
            </>
          )}

          {secondFactor && <p>2FA is required, but this UI does not handle that</p>}
        </form>

      </div>
    </div>
  )
}

export default ForgotPasswordPage