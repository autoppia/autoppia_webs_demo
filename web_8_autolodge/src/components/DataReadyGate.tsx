"use client";
import { useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";
import { isDataGenerationEnabled } from "@/shared/data-generator";

interface DataReadyGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * DataReadyGate ensures hotel data is loaded before rendering children
 * Shows appropriate loading message when AI is generating data
 */
export function DataReadyGate({ children, fallback }: DataReadyGateProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const checkDataReady = async () => {
      try {
        // Check if data generation is enabled and if we have cached data
        const dataGenEnabled = isDataGenerationEnabled();
        const cacheKey = "autolodge_generated_hotels_v1";
        
        // Check cache before starting to load
        let hasCache = false;
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(cacheKey);
          hasCache = cached !== null && cached !== "";
          
          // If data generation is enabled and no cache exists, we're generating
          if (dataGenEnabled && !hasCache) {
            setIsGenerating(true);
          }
        }

        // Wait for data to be ready (this will trigger generation if needed)
        await dynamicDataProvider.whenReady();
        
        setIsReady(true);
        setIsLoading(false);
        setIsGenerating(false);
      } catch (error) {
        console.error('❌ Data loading failed:', error);
        setIsReady(true); // Still render children even if data loading failed
        setIsLoading(false);
        setIsGenerating(false);
      }
    };

    checkDataReady();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center max-w-md px-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#616882] border-t-transparent mx-auto mb-6"></div>
          {isGenerating ? (
            <>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Generating Data with AI
              </h2>
              <p className="text-neutral-600 text-lg mb-2">
                Creating unique hotel listings for you...
              </p>
              <p className="text-neutral-500 text-sm">
                This may take some time. Please wait.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Loading Hotels
              </h2>
              <p className="text-neutral-600">
                Preparing your stay options...
              </p>
            </>
          )}
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
