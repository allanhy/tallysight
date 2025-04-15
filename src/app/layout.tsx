/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from 'next';
import NavigationWrapper from './components/navigationWrapper';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/context/ThemeContext';
import Navigation from '@/app/components/header';
import './globals.css';
import { Montserrat } from 'next/font/google';
import { SportProvider } from '@/context/SportContext';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Tallysight',
  description: 'Your go-to e-gaming gambling site',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <ClerkProvider dynamic>
          <ThemeProvider>
            <SportProvider>
              <div className="flex flex-col min-h-screen">
                <NavigationWrapper />
                <main className="flex-1 mb-10">
                  {children}
                </main>
                 {/* Global Footer */}
                 <footer className="bg-gray-100 dark:bg-[#1f2937]text-black dark:text-gray-200 py-10 px-4
                    border-t border-gray-200 dark:border-gray-700 shadow-md dark:shadow-none transition-colors duration-200">
                      
                  <div className="max-w-screen-xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                      <h2 className="text-4xl sm:text-5xl font-bold mb-2"
                        style={{ letterSpacing: '1.5px' }}>Let's Play</h2>
                      
                      <p className="text-base text-gray-700 dark:text-gray-400">
                        Make your picks • Win points • Dominate the leaderboard
                      </p>
                    </div>

                    {/* Navigation & Info */}
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="flex gap-6 mb-4 md:mb-0">
                        <a href="/info" className="hover:text-blue-600 dark:hover:text-gray-300 transition-colors duration-200">About</a>
                        <a href="/info" className="hover:text-blue-600 dark:hover:text-gray-300 transition-colors duration-200">Rules</a>
                        <a href="/info" className="hover:text-blue-600 dark:hover:text-gray-300 transition-colors duration-200">FAQ</a>
                        <a href="/info" className="hover:text-blue-600 dark:hover:text-gray-300 transition-colors duration-200">Contact</a>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Tallysight. All rights reserved.
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </SportProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}