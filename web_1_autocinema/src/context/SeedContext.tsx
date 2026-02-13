"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clampBaseSeed, resolveSeeds, resolveSeedsSync, type ResolvedSeeds } from "@/shared/seed-resolver";

declare global {
  interface Window {
    __autocinemaV2Seed?: number | null;
  }
  interface WindowEventMap {
    "autocinema:v2SeedChange": CustomEvent<{ seed: number | null }>;
  }
}

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  isSeedReady: boolean; // Indicates whether the seed is synchronized with the URL
  resolvedSeeds: ResolvedSeeds;
}

const DEFAULT_SEED = 1;

const SeedContext = createContext<SeedContextType>({
  seed: DEFAULT_SEED,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  isSeedReady: false,
  resolvedSeeds: resolveSeedsSync(DEFAULT_SEED),
});

const STORAGE_KEY = "autocinema_seed_base";

function SeedInitializer({ onSeedFromUrl }: { onSeedFromUrl: (seed: number | null) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawSeed = searchParams.get("seed");
    if (rawSeed) {
      const parsed = clampBaseSeed(Number.parseInt(rawSeed, 10));
      onSeedFromUrl(parsed);
    } else {
      onSeedFromUrl(null);
    }
  }, [searchParams, onSeedFromUrl]);

  return null;
}

export const SeedProvider = ({ 
  children, 
  initialSeed 
}: { 
  children: React.ReactNode;
  initialSeed?: number; // Seed from Server Component (priority over useSearchParams)
}) => {
  return (
    <Suspense fallback={children}>
      <SeedProviderInner initialSeed={initialSeed}>{children}</SeedProviderInner>
    </Suspense>
  );
};

function SeedProviderInner({ 
  children, 
  initialSeed 
}: { 
  children: React.ReactNode;
  initialSeed?: number;
}) {
  const searchParams = useSearchParams();
  
  // Initialize seed directly from the URL to avoid hydration issues
  const getInitialSeed = (): number => {
    // PRIORITY 1: Read from window.__INITIAL_SEED__ injected by the Server Component
    // This guarantees SSR and client use the same seed from the start
    if (typeof window !== "undefined" && (window as any).__INITIAL_SEED__ !== undefined) {
      const serverSeed = (window as any).__INITIAL_SEED__;
      if (typeof serverSeed === "number" && Number.isFinite(serverSeed)) {
        return clampBaseSeed(serverSeed);
      }
    }
    
    // PRIORITY 2: If initialSeed comes as a prop, use it
    if (initialSeed !== undefined) {
      return clampBaseSeed(initialSeed);
    }
    
    // PRIORITY 3: Try reading from useSearchParams (may fail during SSR)
    try {
      const urlSeed = searchParams.get("seed");
      if (urlSeed) {
        return clampBaseSeed(Number.parseInt(urlSeed, 10));
      }
    } catch (error) {
      // useSearchParams can fail during SSR
    }
    
    // PRIORITY 4: Try reading from window.location (client only)
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlSeed = params.get("seed");
        if (urlSeed) {
          return clampBaseSeed(Number.parseInt(urlSeed, 10));
        }
        
        // If there is no seed in URL, try localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return clampBaseSeed(Number.parseInt(saved, 10));
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    return DEFAULT_SEED;
  };
  
  const [seed, setSeedState] = useState<number>(getInitialSeed);
  const [isSeedReady, setIsSeedReady] = useState<boolean>(false);
  const [resolvedSeeds, setResolvedSeeds] = useState<ResolvedSeeds>(() => resolveSeedsSync(getInitialSeed()));

  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      setSeedState(urlSeed);
      setIsSeedReady(true);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, urlSeed.toString());
        } catch (error) {
          console.error("Error saving seed to localStorage:", error);
        }
      }
    } else {
      // If there is no seed in the URL, the default seed is ready
      setIsSeedReady(true);
    }
  }, []);
  
  // Synchronize seed when the URL changes
  useEffect(() => {
    // Read seed from the URL (priority over window.__INITIAL_SEED__)
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsed = clampBaseSeed(Number.parseInt(urlSeed, 10));
      if (parsed !== seed) {
        console.log(`[autocinema][seed] Actualizando seed desde URL: ${seed} → ${parsed}`);
        setSeedState(parsed);
      }
      setIsSeedReady(true);
    } else {
      // If there is no seed in the URL, check window.__INITIAL_SEED__
      if (typeof window !== "undefined" && (window as any).__INITIAL_SEED__ !== undefined) {
        const initialSeed = clampBaseSeed((window as any).__INITIAL_SEED__);
        if (initialSeed !== seed) {
          console.log(`[autocinema][seed] Actualizando seed desde window.__INITIAL_SEED__: ${seed} → ${initialSeed}`);
          setSeedState(initialSeed);
        }
      }
      setIsSeedReady(true);
    }
  }, [searchParams, seed]);
  
  // Mark as ready after the first client render
  useEffect(() => {
    setIsSeedReady(true);
  }, []);

  useEffect(() => {
    console.log("[autocinema][seed] base=", seed);
  }, [seed]);

  // Resolve per-version seeds through backend
  useEffect(() => {
    let cancelled = false;
    const syncResolved = resolveSeedsSync(seed);
    setResolvedSeeds(syncResolved);

    resolveSeeds(seed)
      .then((resolved) => {
        if (!cancelled) {
          setResolvedSeeds(resolved);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn("[autocinema] Failed to resolve seeds from API, using fallback:", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [seed]);

  // Sync v2 seed to window for data layer listeners
  useEffect(() => {
    if (typeof window === "undefined") return;
    const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base ?? seed;
    (window as any).__autocinemaV2Seed = v2Seed ?? null;
    window.dispatchEvent(new CustomEvent("autocinema:v2SeedChange", { detail: { seed: v2Seed ?? null } }));
  }, [resolvedSeeds.v2, resolvedSeeds.base, seed]);

  const setSeed = useCallback((newSeed: number) => {
    setSeedState(clampBaseSeed(newSeed));
  }, []);

  const getNavigationUrl = useCallback(
    (path: string): string => {
      if (!path) return path;
      if (path.startsWith("http")) return path;
      const currentParams =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const [base, qs] = path.split("?");
      const params = new URLSearchParams(qs || "");
      params.set("seed", seed.toString());
      const enableDynamic = currentParams.get("enable_dynamic");
      if (enableDynamic) {
        params.set("enable_dynamic", enableDynamic);
      }
      const query = params.toString();
      return query ? `${base}?${query}` : base;
    },
    [seed]
  );

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, isSeedReady, resolvedSeeds }}>
      <SeedInitializer onSeedFromUrl={handleSeedFromUrl} />
      {children}
    </SeedContext.Provider>
  );
}

// Custom hook to use seed context
export const useSeed = () => {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error("useSeed must be used within a SeedProvider");
  }
  return context;
};
