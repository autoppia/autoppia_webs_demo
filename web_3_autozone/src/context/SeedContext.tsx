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
  v2Seed: number | null; // Para compatibilidad backward
}

const SeedContext = createContext<SeedContextType>({
  seed: 1,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  resolvedSeeds: resolveSeedsSync(1),
  v2Seed: null,
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

  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsedSeed = Number.parseInt(urlSeed, 10);
      const clampedSeed = Number.isNaN(parsedSeed) ? null : clampBaseSeed(parsedSeed);
      if (clampedSeed !== null) {
        onSeedFromUrl(clampedSeed);
        onSeedChange(clampedSeed);
      } else {
        onSeedFromUrl(null);
      }
    } else {
      onSeedFromUrl(null);
    }
    
    const enableDynamic = searchParams.get("enable_dynamic");
    if (enableDynamic) {
      console.log("[SeedContext:web3] enable_dynamic from URL (user override):", enableDynamic);
    } else {
      console.log("[SeedContext:web3] No enable_dynamic in URL, using env vars as default");
    }
  }, [searchParams, onSeedFromUrl, onSeedChange]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(() => DEFAULT_SEED);
  const [resolvedSeeds, setResolvedSeeds] = useState<ResolvedSeeds>(() =>
    resolveSeedsSync(DEFAULT_SEED)
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [urlSeedProcessed, setUrlSeedProcessed] = useState(false);

  // Initialize seed from localStorage (fallback if no URL seed)
  useEffect(() => {
    if (isInitialized) return;
    
    if (typeof window !== "undefined") {
      try {
        const savedSeed = localStorage.getItem("autozone_seed_base");
        if (savedSeed) {
          const parsedSeed = clampBaseSeed(Number.parseInt(savedSeed, 10));
          setSeedState(parsedSeed);
          console.log(`[SeedContext:web3] Using seed from localStorage: ${parsedSeed}`);
        }
      } catch (error) {
        console.error("Error loading seed from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // Handle seed from URL changes
  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      setUrlSeedProcessed(true);
    } else if (urlSeedProcessed) {
      console.log(`[SeedContext:web3] Seed removed from URL, using default: ${DEFAULT_SEED}`);
      setSeedState(DEFAULT_SEED);
    }
  }, [urlSeedProcessed]);

  // Handle seed change from URL
  const handleSeedChange = useCallback((newSeed: number) => {
    console.log(`[SeedContext:web3] Seed changed in URL: ${newSeed}`);
    setSeedState(newSeed);
  }, []);

  // Update derived seeds + persist base seed
  useEffect(() => {
    let cancelled = false;
    
    // Use sync version for immediate update
    const syncResolved = resolveSeedsSync(seed);
    setResolvedSeeds(syncResolved);
    
    // Fetch from centralized service (async, updates when ready)
    resolveSeeds(seed).then((resolved) => {
      if (!cancelled) {
        setResolvedSeeds(resolved);
      }
    }).catch((error) => {
      if (!cancelled) {
        console.warn("[SeedContext:web3] Failed to resolve seeds from API, using local:", error);
      }
    });
    
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("autozone_seed_base", seed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
    
    return () => {
      cancelled = true;
    };
  }, [seed]);

  // Sync v2Seed to window for backward compatibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
    window.__autozoneV2Seed = v2Seed ?? null;
    window.dispatchEvent(new CustomEvent("autozone:v2SeedChange", { detail: { seed: v2Seed ?? null } }));
    console.log("[SeedContext:web3] v2-seed synced to window:", v2Seed);
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

  // v2Seed for backward compatibility
  const v2Seed = resolvedSeeds.v2 ?? null;

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, resolvedSeeds, v2Seed }}>
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
