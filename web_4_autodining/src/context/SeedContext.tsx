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
import {
  resolveSeeds,
  resolveSeedsSync,
  clampBaseSeed,
  type ResolvedSeeds,
} from "@/shared/seed-resolver";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  resolvedSeeds: ResolvedSeeds;
}

const SeedContext = createContext<SeedContextType>({
  seed: 1,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  resolvedSeeds: resolveSeedsSync(1),
});

const DEFAULT_SEED = 1;

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
      onSeedFromUrl(Number.isNaN(parsedSeed) ? null : clampBaseSeed(parsedSeed));
    } else {
      onSeedFromUrl(null);
    }
    
    // Log enable_dynamic if present (user explicitly set it)
    const enableDynamic = searchParams.get("enable_dynamic");
    if (enableDynamic) {
      console.log("[SeedContext] enable_dynamic from URL (user override):", enableDynamic);
    } else {
      console.log("[SeedContext] No enable_dynamic in URL, using env vars as default");
    }
  }, [searchParams, onSeedFromUrl]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const [seed, setSeedState] = useState<number>(() => DEFAULT_SEED);
  const [resolvedSeeds, setResolvedSeeds] = useState<ResolvedSeeds>(() =>
    resolveSeedsSync(DEFAULT_SEED)
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize seed from localStorage
  useEffect(() => {
    if (isInitialized) return;
    try {
      const savedSeed = localStorage.getItem("autodining_seed_base");
      if (savedSeed) {
        const parsedSeed = clampBaseSeed(Number.parseInt(savedSeed, 10));
        setSeedState(parsedSeed);
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
    }
  }, []);

  // Update derived seeds + persist base seed
  // Re-run when seed OR enable_dynamic changes
  useEffect(() => {
    // Use sync version for immediate update, then fetch from API
    setResolvedSeeds(resolveSeedsSync(seed));
    
    // Fetch from centralized service (async, updates when ready)
    resolveSeeds(seed).then((resolved) => {
      setResolvedSeeds(resolved);
    }).catch((error) => {
      console.warn("[SeedContext] Failed to resolve seeds from API, using local:", error);
    });
    
    try {
      localStorage.setItem("autodining_seed_base", seed.toString());
    } catch (error) {
      console.error("Error saving seed to localStorage:", error);
    }
  }, [seed, searchParams]); // Re-run when searchParams change (to catch enable_dynamic)

  const setSeed = useCallback((newSeed: number) => {
    setSeedState(clampBaseSeed(newSeed));
  }, []);

  // Helper function to generate navigation URLs with seed and enable_dynamic parameters
  const getNavigationUrl = useCallback((path: string): string => {
    if (!path) return path;
    if (path.startsWith("http")) return path;
    
    const currentParams = typeof window !== "undefined" 
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    
    // If path already has query params
    const [base, queryString] = path.split("?");
    const params = new URLSearchParams(queryString || "");
    
    // Always preserve seed
    params.set("seed", seed.toString());
    
    // ONLY preserve enable_dynamic if user explicitly set it in URL
    // If not in URL, don't add it (will use env vars as default)
    const enableDynamic = currentParams.get("enable_dynamic");
    if (enableDynamic) {
      // User explicitly set it, preserve it
      params.set("enable_dynamic", enableDynamic);
    }
    // If not present, don't add it - will use env vars
    
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }, [seed]);

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, resolvedSeeds }}>
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

