// src/app/info/page.tsx
import React from 'react';

export default function InfoPage() {
  return (
    // Outer container with top padding to clear a fixed header (assumed 64px tall)
    <div className="container mx-auto px-4">
      <h1 className="text-black dark:text-white font-semibold mt-6 mb-2 sm:mb-4 text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
  style={{ letterSpacing: '1.5px' }}>
        Information
      </h1>
      
      {/* Main Content Area */}
      <main className="min-h-screen pb-10 bg-white dark:bg-gray-900 transition-colors duration-200">
        
        {/* Navigation */}
        <nav className="bg-[#1f2937] max-w-screen-xl mx-auto mt-6 mb-10 py-4 px-4">
          <ul className="flex flex-col sm:flex-row justify-center gap-6 text-gray-200">
            <li>
              <a 
                href="#about" 
                className="hover:text-gray-400 transition-colors duration-200"
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#rules" 
                className="hover:text-gray-400 transition-colors duration-200"
              >
                Rules
              </a>
            </li>
            <li>
              <a 
                href="#faq" 
                className="hover:text-gray-400 transition-colors duration-200"
              >
                FAQ
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                className="hover:text-gray-400 transition-colors duration-200"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

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
      </main>
    </div>
  );
}