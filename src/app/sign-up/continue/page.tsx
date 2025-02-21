"use client";

import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";

export default function ContinueSignUpPage() {
  const { isLoaded, signUp } = useSignUp();
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isLoaded || !signUp) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      // Update the signed-in user's profile with the new username.
      await signUp.update({ username });
      window.location.href = "/home";
    } catch (error: any) {
      if (error && Array.isArray(error.errors) && error.errors[0]) {
        setErrorMessage(error.errors[0].message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-white dark:bg-black">
      <div className="w-full flex justify-center flex-col items-center">
        <header className="text-center w-full mb-4">
          <div className="text-3xl font-extrabold text-black dark:text-white">
            Continue Sign Up
          </div>
          <h1 className="mt-2 text-xl font-medium tracking-tight text-gray-700 dark:text-gray-300">
            Please choose your username.
          </h1>
        </header>
        <form
          onSubmit={handleSubmit}
          className="relative isolate w-full space-y-6 rounded-2xl bg-white px-8 py-8 shadow-md border border-gray-400 sm:w-[550px] sm:px-10"
        >
          {errorMessage && (
            <div className="mb-2 text-sm text-rose-500">
              {errorMessage}
            </div>
          )}
          <div className="relative">
            <label className="absolute left-2 top-0 -translate-y-1/2 bg-white px-2 font-mono text-xs text-gray-600">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none ring-1 ring-inset ring-gray-300 hover:ring-blue-400 focus:ring-[1.5px] focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-sm font-medium text-white"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
