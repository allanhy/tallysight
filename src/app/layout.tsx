import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "./components/header";
import { ClerkProvider }from '@clerk/nextjs'
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TallySight",
  description: "Your go-to e-gaming gambling site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
