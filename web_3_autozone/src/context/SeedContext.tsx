"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getEffectiveSeed } from "@/utils/dynamicDataProvider";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
}

const SeedContext = createContext<SeedContextType>({
  seed: 1,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
});

// Internal component that handles URL params
function SeedInitializer({ onSeedFromUrl }: { onSeedFromUrl: (seed: number | null) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsedSeed = Number.parseInt(urlSeed, 10);
      // Validate seed is between 1-300
      if (!isNaN(parsedSeed) && parsedSeed >= 1 && parsedSeed <= 300) {
        onSeedFromUrl(parsedSeed);
      } else {
        // Invalid seed, use default
        onSeedFromUrl(1);
      }
    } else {
      onSeedFromUrl(null);
    }
  }, [searchParams, onSeedFromUrl]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle seed from URL (priority over localStorage)
  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      // URL has seed - use it and save to localStorage
      const effectiveSeed = getEffectiveSeed(urlSeed);
      setSeedState(effectiveSeed);
      try {
        localStorage.setItem("autozoneSeed", effectiveSeed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } else if (!isInitialized) {
      // No seed in URL - try localStorage, fallback to 1
      try {
        const savedSeed = localStorage.getItem("autozoneSeed");
        if (savedSeed) {
          const parsedSeed = Number.parseInt(savedSeed, 10);
          if (!isNaN(parsedSeed) && parsedSeed >= 1 && parsedSeed <= 300) {
            const effectiveSeed = getEffectiveSeed(parsedSeed);
            setSeedState(effectiveSeed);
          }
        }
      } catch (error) {
        console.error("Error loading seed:", error);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Update localStorage when seed changes (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("autozoneSeed", seed.toString());
    } catch (error) {
      console.error("Error saving seed to localStorage:", error);
    }
  }, [seed, isInitialized]);


  // Function to set seed and persist it
  const setSeed = useCallback((newSeed: number) => {
    const effectiveSeed = getEffectiveSeed(newSeed);
    setSeedState(effectiveSeed);
  }, []);

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
    // If path already has query params
    if (path.includes('?')) {
      // Check if seed already exists in the URL
      if (path.includes('seed=')) {
        return path;
      }
      return `${path}&seed=${seed}`;
    }
    // Add seed as first query param
    return `${path}?seed=${seed}`;
  }, [seed]);

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl }}>
      <Suspense fallback={null}>
        <SeedInitializer onSeedFromUrl={handleSeedFromUrl} />
      </Suspense>
      {children}
    </SeedContext.Provider>
  );
};

// Custom hook to use seed context
export const useSeed = () => {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error("useSeed must be used within a SeedProvider");
  }
  return context;
};

