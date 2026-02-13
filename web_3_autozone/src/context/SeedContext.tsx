"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { resolveSeedsSync, clampBaseSeed, type ResolvedSeeds } from "@/shared/seed-resolver";

declare global {
  interface Window {
    __autozoneV2Seed?: number | null;
  }
  interface WindowEventMap {
    "autozone:v2SeedChange": CustomEvent<{ seed: number | null }>;
  }
}

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

// Internal component that handles URL params - wrapped in Suspense
function SeedInitializer({
  onSeedFromUrl,
  onSeedChange,
}: {
  onSeedFromUrl: (seed: number | null) => void;
  onSeedChange: (seed: number) => void;
}) {
  const searchParams = useSearchParams();
  const seedParam = searchParams.get("seed");
  const lastAppliedSeedRef = useRef<number | null>(null);

  useEffect(() => {
    if (seedParam) {
      const parsedSeed = Number.parseInt(seedParam, 10);
      const clampedSeed = Number.isNaN(parsedSeed) ? null : clampBaseSeed(parsedSeed);
      if (clampedSeed !== null) {
        onSeedFromUrl(clampedSeed);
        // Prevent spamming state updates/logs if useSearchParams identity changes
        // without the actual seed value changing.
        if (lastAppliedSeedRef.current !== clampedSeed) {
          lastAppliedSeedRef.current = clampedSeed;
          onSeedChange(clampedSeed);
        }
      } else {
        onSeedFromUrl(null);
        lastAppliedSeedRef.current = null;
      }
    } else {
      onSeedFromUrl(null);
      lastAppliedSeedRef.current = null;
    }
  }, [seedParam, onSeedFromUrl, onSeedChange]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(() => DEFAULT_SEED);
  const [resolvedSeeds, setResolvedSeeds] = useState<ResolvedSeeds>(() =>
    resolveSeedsSync(DEFAULT_SEED)
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [urlSeedProcessed, setUrlSeedProcessed] = useState(false);
  const isDebugSeed =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug_seed") === "1";

  // Initialize seed from localStorage (fallback if no URL seed)
  useEffect(() => {
    if (isInitialized) return;
    
    if (typeof window !== "undefined") {
      try {
        const savedSeed = localStorage.getItem("autozone_seed_base");
        if (savedSeed) {
          const parsedSeed = clampBaseSeed(Number.parseInt(savedSeed, 10));
          setSeedState(parsedSeed);
          if (isDebugSeed) {
            console.log(`[SeedContext:web3] Using seed from localStorage: ${parsedSeed}`);
          }
        }
      } catch (error) {
        console.error("Error loading seed from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, [isInitialized, isDebugSeed]);

  // Handle seed from URL changes
  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      setUrlSeedProcessed(true);
    } else if (urlSeedProcessed) {
      // Keep quiet by default; enable with ?debug_seed=1
      if (typeof window !== "undefined") {
        const isDebug =
          new URLSearchParams(window.location.search).get("debug_seed") === "1";
        if (isDebug) {
          console.log(`[SeedContext:web3] Seed removed from URL, using default: ${DEFAULT_SEED}`);
        }
      }
      setSeedState(DEFAULT_SEED);
    }
  }, [urlSeedProcessed]);

  // Handle seed change from URL
  const handleSeedChange = useCallback((newSeed: number) => {
    if (typeof window !== "undefined") {
      const isDebug =
        new URLSearchParams(window.location.search).get("debug_seed") === "1";
      if (isDebug) {
        console.log(`[SeedContext:web3] Seed changed in URL: ${newSeed}`);
      }
    }
    setSeedState(newSeed);
  }, []);

  // Update derived seeds + persist base seed
  useEffect(() => {
    const syncResolved = resolveSeedsSync(seed);
    setResolvedSeeds(syncResolved);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("autozone_seed_base", seed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
  }, [seed]);

  // Sync v2Seed to window for backward compatibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
    window.__autozoneV2Seed = v2Seed ?? null;
    window.dispatchEvent(new CustomEvent("autozone:v2SeedChange", { detail: { seed: v2Seed ?? null } }));
    const isDebug = typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debug_seed") === "1";
    if (isDebug) {
      console.log("[SeedContext:web3] v2-seed synced to window:", v2Seed);
    }
  }, [resolvedSeeds.v2, resolvedSeeds.base]);

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
    
    const [base, queryString] = path.split("?");
    const params = new URLSearchParams(queryString || "");
    
    // Always preserve seed
    params.set("seed", seed.toString());
    
    // ONLY preserve enable_dynamic if user explicitly set it in URL
    const enableDynamic = currentParams.get("enable_dynamic");
    if (enableDynamic) {
      params.set("enable_dynamic", enableDynamic);
    }
    
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }, [seed]);

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, resolvedSeeds }}>
      <Suspense fallback={null}>
        <SeedInitializer onSeedFromUrl={handleSeedFromUrl} onSeedChange={handleSeedChange} />
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
