/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/context/ThemeContext';
import Navigation from '@/app/components/header';
import './globals.css';

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
        <ClerkProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1 pt-16">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}