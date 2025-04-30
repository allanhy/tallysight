// src/app/info/page.tsx
import React from 'react';
import BackToTop from '@/app/components/BackToTop';
import Image from 'next/image';

export default function InfoPage() {
  return (
    <div className="container mx-auto px-4 pt-24">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
        {/* Welcome Text */}
        <div className="text-center sm:text-left">
          <h1 className="relative inline-block text-4xl sm:text-4xl md:text-5xl font-semibold text-black dark:text-white group mt-10 mb-2 text-center">
            Thanks for playing with TallySight!
            <span className="absolute left-0 -bottom-1 h-1 w-0 bg-blue-500 transition-all duration-500 group-hover:w-full"></span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mt-2 sm:mt-4 text-center">
            Learn the rules, get your questions answered, and start making your picks!
          </p>
        </div>
      </div>


      {/* Main Content Area */}
      <main className="min-h-screen pb-10 bg-white dark:bg-gray-900 transition-colors duration-200">
        
        {/* Navigation */}
        <div className="pt-5">
              <nav className="bg-[#1f2937] max-w-screen-xl mx-auto mt-6 mb-20 py-4 px-4 sticky top-16 z-30 rounded-lg">
        <ul className="flex flex-col sm:flex-row justify-center gap-8 text-white text-lg font-semibold">
          <li>
            <a href="#about" className="relative group inline-block transition-colors duration-300 hover:text-blue-400">
              About
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-500 transition-all duration-500 group-hover:w-full"></span>
            </a>
          </li>
          <li>
            <a href="#rules" className="relative group inline-block transition-colors duration-300 hover:text-blue-400">
              Rules
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-500 transition-all duration-500 group-hover:w-full"></span>
            </a>
          </li>
          <li>
            <a href="#faq" className="relative group inline-block transition-colors duration-300 hover:text-blue-400">
              FAQ
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-500 transition-all duration-500 group-hover:w-full"></span>
            </a>
          </li>
          <li>
            <a href="#contact" className="relative group inline-block transition-colors duration-300 hover:text-blue-400">
              Contact
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-500 transition-all duration-500 group-hover:w-full"></span>
            </a>
          </li>
        </ul>
      </nav>
</div>

        {/* About Section */}
        <section id="about" className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">About</h2>
          <p className="text-lg text-gray-800 dark:text-white">
            Welcome to Tallysight – your go-to site for making fun sports betting picks, earning points, and climbing the leaderboard! Our platform is designed for sports enthusiasts who enjoy competitive play without using real money.
          </p>
        </section>

        {/* Rules Section */}
        <section id="rules" className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Rules</h2>
          <p className="text-lg text-gray-800 dark:text-white">
            Our rules are simple and fair: make your picks ahead of time, earn points when your picks win, and enjoy a friendly competitive environment. Please make sure to read the detailed rules below before you start making your selections.
          </p>
          <ul className="list-disc list-inside mt-4 text-lg space-y-2 text-gray-800 dark:text-white">
            <li>Picks must be submitted before game time.</li>
            <li>Points are awarded based on the accuracy of your picks.</li>
            <li>No real money is involved – it’s all for bragging rights and leaderboard ranking!</li>
            <li>Please play responsibly and respect other participants.</li>
          </ul>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Q: How do I make a pick?</h3>
              <p className="text-lg ml-4 text-gray-800 dark:text-white">
                A: Simply register, choose your sport and week, and make your selection before the game starts.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Q: How are points calculated?</h3>
              <p className="text-lg ml-4 text-gray-800 dark:text-white">
                A: Points are based on the accuracy of your predictions. The more accurate your pick, the more points you earn!
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Q: Can I change my pick?</h3>
              <p className="text-lg ml-4 text-gray-800 dark:text-white">
                A: Picks cannot be modified once the game has started. Please double-check your selection before submitting.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Contact</h2>
          <p className="text-lg text-gray-800 dark:text-white">
            If you have any questions or need help, please reach out to us at{' '}
            <a 
              href="mailto:hello@tallysight.com" 
              className="text-blue-600 hover:underline"
            >
              hello@tallysight.com
            </a>
            , or call us at <strong>+1 234 567 890</strong>.
          </p>
          <p className="text-lg mt-10 text-gray-800 dark:text-white">
            If you or someone you know has a gambling problem, help is available. Call <strong>1-800-GAMBLER</strong>.
          </p>
        </section>
        
        {/* Logo */}
        <div className="flex justify-center my-8 transition-transform duration-600 hover:scale-110">
          <Image
            src="/tallysight-logo.png"
            alt="TallySight Logo"
            width={110}
            height={100}
            priority
            className="object-contain"
          />
        </div>
      </main>
      <BackToTop />
    </div>
  );
}