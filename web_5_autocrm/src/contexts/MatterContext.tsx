"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";

interface MatterContextType {
  matters: any[];
  isLoading: boolean;
  getMatterById: (id: string) => any | undefined;
  searchMatters: (query: string) => any[];
}

const MatterContext = createContext<MatterContextType | undefined>(undefined);

export function MatterProvider({ children }: { children: React.ReactNode }) {
  const [matters, setMatters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Initial load
    const loadData = async () => {
      try {
        await dynamicDataProvider.whenReady();
        const loadedMatters = dynamicDataProvider.getMatters();
        if (isMounted) {
          console.log(`📊 Initial matters load: ${loadedMatters.length} matters`);
          setMatters(loadedMatters);
          // Set loading to false if we have data
          // If no data but provider is ready, also stop loading (might be generation disabled)
          if (loadedMatters.length > 0) {
            setIsLoading(false);
          } else if (dynamicDataProvider.isReady()) {
            // Provider is ready but no data - might be generation disabled
            setIsLoading(false);
          }
          // Otherwise keep loading and let polling handle it
        }
      } catch (error) {
        console.error("Failed to load matters:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Start polling immediately to catch data that arrives asynchronously
    // Poll for data updates (similar to web7)
    // Check every 2 seconds for data changes
    const pollForData = () => {
      if (!isMounted) return;
      
      const currentMatters = dynamicDataProvider.getMatters();
      const currentLength = currentMatters.length;
      
      // Update matters if length changed
      setMatters(prevMatters => {
        const prevLength = prevMatters.length;
        
        // Update if length changed
        if (prevLength !== currentLength) {
          console.log(`📊 Matters updated: ${prevLength} → ${currentLength}`);
          return [...currentMatters];
        }
        return prevMatters;
      });
      
      // Update loading state: stop loading if we have data
      if (currentLength > 0) {
        setIsLoading(prev => {
          if (prev) {
            console.log(`✅ Matters data available, stopping loading state`);
          }
          return false;
        });
      } else if (dynamicDataProvider.isReady()) {
        // Provider is ready but no data - might be generation disabled or failed
        setIsLoading(prev => {
          if (prev) {
            console.log(`⚠️ Provider ready but no matters data`);
          }
          return false;
        });
      }
    };

    // Poll immediately, then set up interval
    pollForData();
    pollInterval = setInterval(pollForData, 2000);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []); // Remove isLoading from dependencies to avoid stale closures

  const getMatterById = (id: string) => {
    return dynamicDataProvider.getMatterById(id);
  };

  const searchMatters = (query: string) => {
    return dynamicDataProvider.searchMatters(query);
  };

  const value: MatterContextType = {
    matters,
    isLoading,
    getMatterById,
    searchMatters,
  };

  return (
    <MatterContext.Provider value={value}>
      {children}
    </MatterContext.Provider>
  );
}

export function useMatters() {
  const context = useContext(MatterContext);
  if (context === undefined) {
    throw new Error("useMatters must be used within a MatterProvider");
  }
  return context;
}

