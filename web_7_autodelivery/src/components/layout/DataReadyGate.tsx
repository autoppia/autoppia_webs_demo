"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";

interface DataReadyGateProps {
  children: React.ReactNode;
}

/**
 * DataReadyGate Component
 *
 * This component ensures that data generation/loading is complete before rendering children.
 * It shows a loading state while data is being initialized from:
 * - AI generation API
 * - Database seeded selection
 * - Static fallback data
 */
export function DataReadyGate({ children }: DataReadyGateProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isReady, setIsReady] = useState(() => dynamicDataProvider.isReady());

  useEffect(() => {
    setHasMounted(true);

    // Check if already ready
    const checkReady = () => {
      const ready = dynamicDataProvider.isReady();
      if (ready) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (checkReady()) {
      return;
    }

    // Wait for data to be ready
    dynamicDataProvider.whenReady().then(() => {
      // Double check the state after promise resolves
      checkReady();
    }).catch(() => {
      // Still set ready to prevent infinite loading
      setIsReady(true);
    });

    // Also subscribe to restaurant updates to catch when data is loaded
    const unsubscribe = dynamicDataProvider.subscribeRestaurants((restaurants) => {
      if (restaurants.length > 0 && dynamicDataProvider.isReady()) {
        setIsReady(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Keep first client render aligned with SSR to avoid hydration mismatch.
  if (!hasMounted) {
    return <>{children}</>;
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="text-lg font-semibold text-foreground">Loading data...</p>
          <p className="text-sm text-muted-foreground">Preparing your AutoDelivery experience...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
