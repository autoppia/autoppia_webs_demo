"use client";

import { useEffect, useState } from "react";
import { whenReady } from "@/utils/dynamicDataProvider";
import { isDataGenerationEnabled } from "@/shared/data-generator";

export function DataReadyGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const dataGenEnabled = isDataGenerationEnabled();

  useEffect(() => {
    // Only show loading if data generation is enabled
    if (!dataGenEnabled) {
      setIsReady(true);
      return;
    }

    setIsGenerating(true);
    
    // Wait for all data to be ready
    whenReady()
      .then(() => {
        setIsReady(true);
        setIsGenerating(false);
      })
      .catch((error) => {
        console.error("Error waiting for data:", error);
        // Even if there's an error, show the content after a delay
        setTimeout(() => {
          setIsReady(true);
          setIsGenerating(false);
        }, 3000);
      });
  }, [dataGenEnabled]);

  // If data generation is not enabled, show content immediately
  if (!dataGenEnabled) {
    return <>{children}</>;
  }

  // Show loading screen while generating
  if (!isReady || isGenerating) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          {/* Loading Spinner */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-accent-forest/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-accent-forest border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          {/* AI Generation Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-zinc-800">
              Generating Data with AI
            </h2>
            <p className="text-zinc-600 text-lg">
              Please wait while we generate your CRM data using artificial intelligence...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 mt-4">
              <svg
                className="animate-pulse w-4 h-4 text-accent-forest"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span>This may take a few moments</span>
            </div>
          </div>

          {/* Progress Dots Animation */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 bg-accent-forest rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-accent-forest rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-accent-forest rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Data is ready, show content
  return <>{children}</>;
}

