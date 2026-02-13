"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

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
  const [isReady, setIsReady] = useState(() => {
    const ready = dynamicDataProvider.isReady();
    console.log("[DataReadyGate] Initial state check - ready:", ready);
    return ready;
  });

  useEffect(() => {
    // Check if already ready
    const checkReady = () => {
      const ready = dynamicDataProvider.isReady();
      console.log("[DataReadyGate] Checking ready state:", ready);
      if (ready) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (checkReady()) {
      return;
    }

    console.log("[DataReadyGate] Not ready yet, waiting for whenReady()...");
    // Wait for data to be ready
    dynamicDataProvider.whenReady().then(() => {
      console.log("[DataReadyGate] whenReady() resolved, checking state again...");
      // Double check the state after promise resolves
      checkReady();
    }).catch((error) => {
      console.error("[DataReadyGate] Error waiting for ready:", error);
      // Still set ready to prevent infinite loading
      setIsReady(true);
    });

    // Also subscribe to restaurant updates to catch when data is loaded
    const unsubscribe = dynamicDataProvider.subscribeRestaurants((restaurants) => {
      console.log("[DataReadyGate] Restaurant subscription update - restaurants:", restaurants.length);
      if (restaurants.length > 0 && dynamicDataProvider.isReady()) {
        console.log("[DataReadyGate] Restaurants loaded and ready, setting isReady to true");
        setIsReady(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-semibold text-foreground">
            {isDbLoadModeEnabled() ? "Loading Data..." : "Initializing..."}
          </p>
          <p className="text-sm text-muted-foreground">
            {isDbLoadModeEnabled()
              ? "Fetching restaurants from database..."
              : "Preparing your food delivery app..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
