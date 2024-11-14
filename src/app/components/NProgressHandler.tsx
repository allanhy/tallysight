// components/NProgressHandler.tsx
"use client";
import { useEffect } from "react";
import NProgress from "nprogress";
import "./nprogress.css";
import { usePathname } from "next/navigation"; // Use usePathname instead of useRouter

NProgress.configure({ showSpinner: false });

const NProgressHandler = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Start the loading bar whenever pathname changes
    NProgress.start();

    // Finish loading after a small delay to simulate page load
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [pathname]); // Runs whenever pathname changes

  return null;
};

export default NProgressHandler;
