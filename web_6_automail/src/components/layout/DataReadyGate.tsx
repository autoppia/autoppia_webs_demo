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
    // Check if already ready
    if (dynamicDataProvider.isReady()) {
      setIsReady(true);
      return;
    }

    // Wait for data to be ready
    dynamicDataProvider.whenReady().then(() => {
      setIsReady(true);
    });
  }, []);

  // Determine loading message based on mode
  const getLoadingMessage = () => {
    if (isDataGenerationEnabled()) {
      return {
        title: "Generating Data...",
        subtitle: "AI is creating realistic emails. This may take a few moments."
      };
    } else if (isDbLoadModeEnabled()) {
      return {
        title: "Loading Data...",
        subtitle: "Fetching emails from database..."
      };
    } else {
      return {
        title: "Initializing...",
        subtitle: "Preparing your email client..."
      };
    }
  };

  if (!isReady) {
    const message = getLoadingMessage();
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-semibold text-foreground">{message.title}</p>
          <p className="text-sm text-muted-foreground">{message.subtitle}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

