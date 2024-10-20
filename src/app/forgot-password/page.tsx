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
    <div className = "relative grid w-full flex-grow items-center px-4 sm:justify-center">
      <header className="text-center relative isolate w-full space-y-8 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-inset ring-gray-300 before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-50 sm:w-96 sm:px-8">
        <h1 className="text-center">
          <div className='text-3xl font-bold italic text-blue-600 uppercase'>
            TALLYSIGHT
          </div>
          <h2
            className="mt-4 text-xl font-medium tracking-tight text-gray-800">
            Reset your password
          </h2>
        </h1>
        <form
          onSubmit={!successfulCreation ? create : reset}
        >
          {!successfulCreation && (
            <>
              <label htmlFor="email">
                <h3 className="absolute left-10 -translate-y-1/2 bg-white px-2 font-mono text-xs/4 text-gray-600 before:absolute before:inset-0 before:-z-10 before:bg-white group-focus-within/field:text-blue-600 group-data-[invalid]/field:text-rose-400">
                Please enter your email address
                </h3>
              </label>
              <input
                type="email"
                placeholder="e.g john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600 data-[invalid]:shadow-rose-400/20 data-[invalid]:ring-rose-400"
              />
              <button
                className="">
                Send code
              </button>
              {error && <p>{error}</p>}
            </>
          )}

          {successfulCreation && (
            <>
              <label htmlFor="password">Enter your new password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <label htmlFor="password">
                Enter the password reset code that was sent to your email
              </label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />

              <button>Reset</button>
              {error && <p>{error}</p>}
            </>
          )}

          {secondFactor && <p>2FA is required, but this UI does not handle that</p>}
        </form>
      </header>
    </div>
  )
}

export default ForgotPasswordPage