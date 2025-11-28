"use client";

import { useEffect } from "react";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig } from "@/dynamic/v2-data";

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const { seed } = useSeed();
  const layoutConfig = getLayoutConfig(seed);

  useEffect(() => {
    // Remove any existing navbar classes
    document.body.classList.remove('navbar-side', 'navbar-hidden-top', 'navbar-floating', 'navbar-top');
    
    // Add the appropriate navbar class based on layout config
    switch (layoutConfig.navbarStyle) {
      case 'side':
        document.body.classList.add('navbar-side');
        break;
      case 'hidden-top':
        document.body.classList.add('navbar-hidden-top');
        break;
      case 'floating':
        document.body.classList.add('navbar-floating');
        break;
      default:
        document.body.classList.add('navbar-top');
    }
  }, [layoutConfig.navbarStyle]);

  return <>{children}</>;
}
