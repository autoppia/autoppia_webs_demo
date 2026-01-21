"use client";
import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";

interface DataReadyGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * DataReadyGate ensures hotel data is loaded before rendering children
 */
export function DataReadyGate({ children, fallback }: DataReadyGateProps) {
  const [isReady, setIsReady] = useState(() => {
    const ready = dynamicDataProvider.isReady();
    console.log("[DataReadyGate] Initial state check - ready:", ready);
    return ready;
  });
  const [isLoading, setIsLoading] = useState(!dynamicDataProvider.isReady());

  useEffect(() => {
    // Check if already ready
    const checkReady = () => {
      const ready = dynamicDataProvider.isReady();
      console.log("[DataReadyGate] Checking ready state:", ready);
      if (ready) {
        setIsReady(true);
        setIsLoading(false);
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
      setIsLoading(false);
    });

    // Also subscribe to hotel updates to catch when data is loaded
    const unsubscribe = dynamicDataProvider.subscribeHotels((hotels) => {
      console.log("[DataReadyGate] Hotel subscription update - hotels:", hotels.length);
      if (hotels.length > 0 && dynamicDataProvider.isReady()) {
        console.log("[DataReadyGate] Hotels loaded and ready, setting isReady to true");
        setIsReady(true);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#616882] mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-neutral-600">Failed to load data</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
