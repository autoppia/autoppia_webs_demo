"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSeedFromUrl } from "@/components/library/utils";

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
  onV2SeedFromUrl 
}: { 
  onSeedFromUrl: (seed: number | null) => void;
  onV2SeedFromUrl: (v2Seed: number | null) => void;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if v1 (dynamic HTML) is enabled
    const isV1Enabled = (): boolean => {
      if (typeof window === "undefined") return false;
      const raw = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML || "").toString().toLowerCase();
      return raw === "true";
    };

    // Check if v2 (DB mode) is enabled
    const isV2Enabled = (): boolean => {
      if (typeof window === "undefined") return false;
      const raw = (process.env.NEXT_PUBLIC_ENABLE_DB_MODE || process.env.ENABLE_DB_MODE || "").toString().toLowerCase();
      const enabled = raw === "true";
      console.log("[SeedContext] isV2Enabled check:", {
        NEXT_PUBLIC_ENABLE_DB_MODE: process.env.NEXT_PUBLIC_ENABLE_DB_MODE,
        ENABLE_DB_MODE: process.env.ENABLE_DB_MODE,
        raw,
        enabled
      });
      return enabled;
    };

    // Only process seed parameter if v1 is enabled
    if (isV1Enabled()) {
      const urlSeed = searchParams.get("seed");
      if (urlSeed) {
        const parsedSeed = Number.parseInt(urlSeed, 10);
        // Validate seed is between 1-300
        const effectiveSeed = (parsedSeed >= 1 && parsedSeed <= 300) ? parsedSeed : 1;
        onSeedFromUrl(effectiveSeed);
      } else {
        onSeedFromUrl(null);
      }
    } else {
      // If v1 is not enabled, ignore seed parameter
      onSeedFromUrl(null);
    }

    // Only process v2-seed parameter if v2 is enabled
    const v2Enabled = isV2Enabled();
    const urlV2Seed = searchParams.get("v2-seed");
    console.log("[SeedContext] v2-seed processing:", { v2Enabled, urlV2Seed });
    
    if (v2Enabled) {
      if (urlV2Seed) {
        const parsedV2Seed = Number.parseInt(urlV2Seed, 10);
        // Validate v2-seed is between 1-300
        const effectiveV2Seed = (parsedV2Seed >= 1 && parsedV2Seed <= 300) ? parsedV2Seed : null;
        console.log("[SeedContext] Parsed v2-seed:", { parsedV2Seed, effectiveV2Seed });
        onV2SeedFromUrl(effectiveV2Seed);
      } else {
        onV2SeedFromUrl(null);
      }
    } else {
      // If v2 is not enabled, ignore v2-seed parameter
      console.log("[SeedContext] v2 not enabled, ignoring v2-seed");
      onV2SeedFromUrl(null);
    }
  }, [searchParams, onSeedFromUrl, onV2SeedFromUrl]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(1);
  const [v2Seed, setV2SeedState] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if v1 (dynamic HTML) is enabled
  const isV1Enabled = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const raw = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML || "").toString().toLowerCase();
    return raw === "true";
  }, []);

  // Initialize seed from localStorage on mount (only if v1 is enabled)
  useEffect(() => {
    if (isInitialized) return;
    if (!isV1Enabled()) {
      // If v1 is not enabled, don't load seed from localStorage
      setIsInitialized(true);
      return;
    }

    try {
      const savedSeed = localStorage.getItem("autodining_seed");
      if (savedSeed) {
        const parsedSeed = Number.parseInt(savedSeed, 10);
        const effectiveSeed = (parsedSeed >= 1 && parsedSeed <= 300) ? parsedSeed : 1;
        setSeedState(effectiveSeed);
      }
    } catch (error) {
      console.error("Error loading seed:", error);
    }
    setIsInitialized(true);
  }, [isInitialized, isV1Enabled]);

  // Handle seed from URL (only if v1 is enabled)
  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (!isV1Enabled()) {
      // If v1 is not enabled, ignore seed
      return;
    }
    if (urlSeed !== null) {
      setSeedState(urlSeed);
      try {
        localStorage.setItem("autodining_seed", urlSeed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
  }, [isV1Enabled]);

  // Handle v2-seed from URL (don't persist to localStorage, only use from URL)
  const handleV2SeedFromUrl = useCallback((urlV2Seed: number | null) => {
    setV2SeedState(urlV2Seed);
  }, []);

  // Update localStorage when seed changes (only if v1 is enabled)
  useEffect(() => {
    if (!isInitialized) return;
    if (!isV1Enabled()) return; // Don't persist seed when v1 is not enabled
    try {
      localStorage.setItem("autodining_seed", seed.toString());
    } catch (error) {
      console.error("Error saving seed to localStorage:", error);
    }
  }, [seed, isInitialized, isV1Enabled]);

  // Function to set seed and persist it (only if v1 is enabled)
  const setSeed = useCallback((newSeed: number) => {
    if (!isV1Enabled()) {
      // If v1 is not enabled, don't allow setting seed
      return;
    }
    const effectiveSeed = (newSeed >= 1 && newSeed <= 300) ? newSeed : 1;
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

