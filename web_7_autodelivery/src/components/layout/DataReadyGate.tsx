"use client";

import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";
import { isDataGenerationEnabled } from "@/shared/data-generator";
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we have data available
    const restaurants = dynamicDataProvider.getRestaurants();
    if (restaurants && restaurants.length > 0) {
      console.log("✅ DataReadyGate: Data already available, showing content");
      setIsReady(true);
      return;
    }

    // If no data, wait for it to load
    console.log("⏳ DataReadyGate: Waiting for data to load...");
    dynamicDataProvider.whenReady().then(() => {
      console.log("✅ DataReadyGate: Data loaded, showing content");
      setIsReady(true);
    }).catch((error) => {
      console.error("❌ DataReadyGate: Error loading data:", error);
      // Show content anyway after a delay
      setTimeout(() => {
        console.log("⏰ DataReadyGate: Timeout, showing content anyway");
        setIsReady(true);
      }, 2000);
    });
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-semibold text-foreground">Loading Data...</p>
          <p className="text-sm text-muted-foreground">Fetching restaurants from database...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

