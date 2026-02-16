"use client";
import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2";
import { useSeed } from "@/context/SeedContext";

interface DataReadyGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * DataReadyGate ensures autoconnect data is loaded before rendering children
 */
export function DataReadyGate({ children, fallback }: DataReadyGateProps) {
  const { seed } = useSeed();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkDataReady = async () => {
      try {
        // Ensure provider is reloaded when seed changes.
        dynamicDataProvider.reloadIfSeedChanged(seed);
        await dynamicDataProvider.whenReady();
        if (!mounted) return;
        setIsReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Data loading failed:', error);
        if (!mounted) return;
        setIsReady(true); // Still render children even if data loading failed
        setIsLoading(false);
      }
    };

    checkDataReady();

    // Subscribe to data updates
    const unsubscribeUsers = dynamicDataProvider.subscribeUsers(() => {
      if (!mounted) return;
      if (dynamicDataProvider.isReady()) {
        setIsReady(true);
        setIsLoading(false);
      }
    });

    const unsubscribePosts = dynamicDataProvider.subscribePosts(() => {
      if (!mounted) return;
      if (dynamicDataProvider.isReady()) {
        setIsReady(true);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribeUsers();
      unsubscribePosts();
    };
  }, [seed]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Generating data with AI</p>
          <p className="text-gray-500 text-sm mt-2">This may take some time...</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Failed to load data</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
