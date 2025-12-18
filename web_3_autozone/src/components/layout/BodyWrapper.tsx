"use client";

import { useEffect } from "react";

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove any existing navbar classes
    document.body.classList.remove('navbar-side', 'navbar-hidden-top', 'navbar-floating', 'navbar-top');
    
    // Layout variations are disabled in web3 (legacy v1-layouts always returned default).
    // Keep a stable class to avoid layout shifts.
    document.body.classList.add('navbar-top');
  }, []);

  return <>{children}</>;
}
