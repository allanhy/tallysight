"use client";

import { usePathname } from 'next/navigation';
import Navigation from '@/app/components/header';

export default function NavigationWrapper() {
  const pathname = usePathname();
  
  if (pathname === '/daily-picks' || pathname === '/tomorrow-picks') {        // This is so the header does not appear while using this page.
    return null; 
  }

  return <Navigation />;
}