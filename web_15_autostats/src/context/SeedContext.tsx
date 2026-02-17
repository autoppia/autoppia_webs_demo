"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
}

const SeedContext = createContext<SeedContextType>({
  seed: 8,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
});

const DEFAULT_SEED = 8;

// Clamp seed to valid range
function clampSeed(seed: number): number {
  return Math.max(1, Math.min(999999, Math.floor(seed)));
}

// Internal component that handles URL params
function SeedInitializer({
  onSeedFromUrl,
}: {
  onSeedFromUrl: (seed: number | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsedSeed = Number.parseInt(urlSeed, 10);
      onSeedFromUrl(Number.isNaN(parsedSeed) ? null : clampSeed(parsedSeed));
    } else {
      onSeedFromUrl(null);
    }
  }, [searchParams, onSeedFromUrl]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(() => DEFAULT_SEED);
  const [isInitialized, setIsInitialized] = useState(false);
  const [urlSeedProcessed, setUrlSeedProcessed] = useState(false);

  // Initialize seed from localStorage on mount (client-side only)
  useEffect(() => {
    if (isInitialized) return;
    
    // Try localStorage only on client-side
    if (typeof window !== "undefined") {
      try {
        const savedSeed = localStorage.getItem("autostats_seed");
        if (savedSeed) {
          const parsedSeed = clampSeed(Number.parseInt(savedSeed, 10));
          setSeedState(parsedSeed);
          console.log(`[SeedContext] Using seed from localStorage: ${parsedSeed}`);
        }
      } catch (error) {
        console.error("Error loading seed from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // Handle seed from URL changes (when URL changes after initial load)
  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      console.log(`[SeedContext] Seed changed in URL: ${urlSeed}`);
      setSeedState(urlSeed);
      setUrlSeedProcessed(true);
    } else if (urlSeedProcessed) {
      // URL seed was removed, but we already processed it
      console.log(`[SeedContext] Seed removed from URL, using default: ${DEFAULT_SEED}`);
      setSeedState(DEFAULT_SEED);
    }
  }, [urlSeedProcessed]);

  // Persist seed to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("autostats_seed", seed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
  }, [seed]);

  const setSeed = useCallback((newSeed: number) => {
    setSeedState(clampSeed(newSeed));
  }, []);

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
    if (!path) return path;
    if (path.startsWith("http")) return path;
    
    // If path already has query params
    const [base, queryString] = path.split("?");
    const params = new URLSearchParams(queryString || "");
    
    // Always preserve seed
    params.set("seed", seed.toString());
    
    const query = params.toString();
    return query ? `${base}?${query}` : base;
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
