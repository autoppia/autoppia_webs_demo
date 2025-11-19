"use client";
import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/dynamic/v2-data";

interface DataReadyGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * DataReadyGate ensures autoconnect data is loaded before rendering children
 */
export function DataReadyGate({ children, fallback }: DataReadyGateProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDataReady = async () => {
      try {
        await dynamicDataProvider.whenReady();
        setIsReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Data loading failed:', error);
        setIsReady(true); // Still render children even if data loading failed
        setIsLoading(false);
      }
    };

    checkDataReady();
  }, []);

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
