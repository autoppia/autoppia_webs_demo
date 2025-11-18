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

const clampSeed = (value: number): number => {
  if (!Number.isFinite(value)) return 1;
  if (value < 1 || value > 300) return 1;
  return value;
};

const parseSeedValue = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const isV2DbModeEnabled =
  (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
    process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
    ""
  )
    .toString()
    .toLowerCase() === "true";

const V2_STORAGE_KEY = "autocinema_v2_seed";

// Internal component that handles URL params
function SeedInitializer({
  onSeedFromUrl,
  onV2SeedFromUrl,
}: {
  onSeedFromUrl: (seed: number | null) => void;
  onV2SeedFromUrl: (seed: number | null) => void;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsedSeed = parseSeedValue(urlSeed);
      const effectiveSeed = getEffectiveSeed(clampSeed(parsedSeed ?? 1));
      onSeedFromUrl(effectiveSeed);
    } else {
      onSeedFromUrl(null);
    }

    if (isV2DbModeEnabled) {
      let resolvedV2: number | null = null;
      const rawV2 = parseSeedValue(searchParams.get("v2-seed"));
      if (rawV2 !== null) {
        resolvedV2 = clampSeed(rawV2);
      } else if (typeof window !== "undefined") {
        try {
          const stored = parseSeedValue(localStorage.getItem(V2_STORAGE_KEY));
          if (stored !== null) {
            resolvedV2 = clampSeed(stored);
            const url = new URL(window.location.href);
            url.searchParams.set("v2-seed", resolvedV2.toString());
            window.history.replaceState(null, "", url.toString());
          }
        } catch {
          resolvedV2 = null;
        }
      }

      onV2SeedFromUrl(resolvedV2);

      try {
        if (resolvedV2 !== null) {
          localStorage.setItem(V2_STORAGE_KEY, resolvedV2.toString());
        } else {
          localStorage.removeItem(V2_STORAGE_KEY);
        }
      } catch {
        // ignore storage issues
      }
    } else {
      onV2SeedFromUrl(null);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("v2-seed")) {
          url.searchParams.delete("v2-seed");
          window.history.replaceState(null, "", url.toString());
        }
      }
    }
  }, [searchParams, onSeedFromUrl, onV2SeedFromUrl]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [v2Seed, setV2Seed] = useState<number | null>(null);

  // Initialize seed from localStorage on mount
  useEffect(() => {
    if (isInitialized) return;

    try {
      const savedSeed = localStorage.getItem("autocinemaSeed");
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
    if (urlSeed !== null) {
      setSeedState(urlSeed);
      try {
        localStorage.setItem("autocinemaSeed", urlSeed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
  }, []);

  const handleV2SeedFromUrl = useCallback((seedValue: number | null) => {
    setV2Seed(seedValue);
  }, []);

  // Update localStorage when seed changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("autocinemaSeed", seed.toString());
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
        if (isV2DbModeEnabled && v2Seed !== null && !path.includes("v2-seed=")) {
          return `${path}&v2-seed=${v2Seed}`;
        }
        return path;
      }
      const withSeed = `${path}&seed=${seed}`;
      if (isV2DbModeEnabled && v2Seed !== null) {
        return `${withSeed}&v2-seed=${v2Seed}`;
      }
      return withSeed;
    }
    // Add seed as first query param
    if (isV2DbModeEnabled && v2Seed !== null) {
      return `${path}?seed=${seed}&v2-seed=${v2Seed}`;
    }
    return `${path}?seed=${seed}`;
  }, [seed, v2Seed]);

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, v2Seed }}>
      <Suspense fallback={null}>
        <SeedInitializer
          onSeedFromUrl={handleSeedFromUrl}
          onV2SeedFromUrl={handleV2SeedFromUrl}
        />
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
