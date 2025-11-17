"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getEffectiveSeed } from "@/utils/dynamicDataProvider";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  v2Seed: number | null;
}

const SeedContext = createContext<SeedContextType>({
  seed: 1,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  v2Seed: null,
});

// Internal component that handles URL params
function SeedInitializer({ 
  onSeedFromUrl,
  onV2SeedFromUrl,
}: { 
  onSeedFromUrl: (seed: number | null) => void;
  onV2SeedFromUrl: (v2Seed: number | null) => void;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const isV1Enabled = (): boolean => {
      if (typeof window === "undefined") return false;
      const raw = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML || process.env.ENABLE_DYNAMIC_HTML || "").toString().toLowerCase();
      return raw === "true";
    };

    const isV2Enabled = (): boolean => {
      if (typeof window === "undefined") return false;
      const raw = (process.env.NEXT_PUBLIC_ENABLE_DB_MODE || process.env.ENABLE_DB_MODE || "").toString().toLowerCase();
      return raw === "true";
    };

    if (isV1Enabled()) {
      const urlSeed = searchParams.get("seed");
      if (urlSeed) {
        const parsedSeed = Number.parseInt(urlSeed, 10);
        const effectiveSeed = getEffectiveSeed(parsedSeed);
        onSeedFromUrl(effectiveSeed);
      } else {
        onSeedFromUrl(null);
      }
    } else {
      onSeedFromUrl(null);
    }

    const v2Enabled = isV2Enabled();
    const urlV2Seed = searchParams.get("v2-seed");

    if (v2Enabled) {
      if (urlV2Seed) {
        const parsedV2Seed = Number.parseInt(urlV2Seed, 10);
        if (parsedV2Seed >= 1 && parsedV2Seed <= 300) {
          onV2SeedFromUrl(parsedV2Seed);
        } else {
          onV2SeedFromUrl(null);
        }
      } else {
        onV2SeedFromUrl(null);
      }
    } else {
      onV2SeedFromUrl(null);
    }
  }, [searchParams, onSeedFromUrl, onV2SeedFromUrl]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(1);
  const [v2Seed, setV2SeedState] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isV1Enabled = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const raw = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML || process.env.ENABLE_DYNAMIC_HTML || "").toString().toLowerCase();
    return raw === "true";
  }, []);

  // Initialize seed from localStorage on mount
  useEffect(() => {
    if (isInitialized) return;
    if (!isV1Enabled()) {
      setIsInitialized(true);
      return;
    }

    try {
      const savedSeed = localStorage.getItem("autocrmSeed");
      if (savedSeed) {
        const parsedSeed = Number.parseInt(savedSeed, 10);
        const effectiveSeed = getEffectiveSeed(parsedSeed);
        setSeedState(effectiveSeed);
      }
    } catch (error) {
      console.error("Error loading seed:", error);
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // Handle seed from URL
  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (!isV1Enabled()) return;
    if (urlSeed !== null) {
      const effectiveSeed = getEffectiveSeed(urlSeed);
      setSeedState(effectiveSeed);
      try {
        localStorage.setItem("autocrmSeed", effectiveSeed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
  }, [isV1Enabled]);

  const handleV2SeedFromUrl = useCallback((urlV2Seed: number | null) => {
    setV2SeedState(urlV2Seed);
  }, []);

  // Update localStorage when seed changes
  useEffect(() => {
    if (!isInitialized) return;
    if (!isV1Enabled()) return;
    try {
      localStorage.setItem("autocrmSeed", seed.toString());
    } catch (error) {
      console.error("Error saving seed to localStorage:", error);
    }
  }, [seed, isInitialized, isV1Enabled]);

  // Function to set seed and persist it
  const setSeed = useCallback((newSeed: number) => {
    if (!isV1Enabled()) return;
    const effectiveSeed = getEffectiveSeed(newSeed);
    setSeedState(effectiveSeed);
  }, [isV1Enabled]);

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
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, v2Seed }}>
      <Suspense fallback={null}>
        <SeedInitializer onSeedFromUrl={handleSeedFromUrl} onV2SeedFromUrl={handleV2SeedFromUrl} />
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

