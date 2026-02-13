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
import { resolveSeedsSync, clampBaseSeed, type ResolvedSeeds } from "@/shared/seed-resolver";

declare global {
  interface Window {
    __autocrmV2Seed?: number | null;
  }
  interface WindowEventMap {
    "autocrm:v2SeedChange": CustomEvent<{ seed: number | null }>;
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

  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsedSeed = Number.parseInt(urlSeed, 10);
      const clampedSeed = Number.isNaN(parsedSeed) ? null : clampBaseSeed(parsedSeed);
      onSeedFromUrl(clampedSeed);
      if (clampedSeed !== null) {
        onSeedChange(clampedSeed);
      }
    } else {
      onSeedFromUrl(null);
    }
    
    const enableDynamic = searchParams.get("enable_dynamic");
    if (enableDynamic) {
      console.log("[SeedContext:web5] enable_dynamic from URL (user override):", enableDynamic);
    } else {
      console.log("[SeedContext:web5] No enable_dynamic in URL, using env vars as default");
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
        const savedSeed = localStorage.getItem("autocrm_seed_base");
        if (savedSeed) {
          const parsedSeed = clampBaseSeed(Number.parseInt(savedSeed, 10));
          setSeedState(parsedSeed);
          console.log(`[SeedContext:web5] Using seed from localStorage: ${parsedSeed}`);
        }
      } catch (e) {
        console.error("[SeedContext:web5] Error loading seed from localStorage", e);
      }
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Handler for URL seed changes
  const handleSeedFromUrl = useCallback(
    (urlSeed: number | null) => {
      if (urlSeed !== null && urlSeed !== seed) {
        setSeedState(urlSeed);
        console.log(`[SeedContext:web5] Updated seed from URL: ${urlSeed}`);
      }
      setUrlSeedProcessed(true);
    },
    [seed]
  );

  // Handler for seed changes (from SeedInitializer)
  const handleSeedChange = useCallback((newSeed: number) => {
    setSeedState(newSeed);
  }, []);

  // Save seed to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && urlSeedProcessed && typeof window !== "undefined") {
      try {
        localStorage.setItem("autocrm_seed_base", seed.toString());
      } catch (e) {
        console.error("[SeedContext:web5] Error saving seed to localStorage", e);
      }
    }
  }, [seed, isInitialized, urlSeedProcessed]);

  // Update resolved seeds when seed changes
  useEffect(() => {
    const resolved = resolveSeedsSync(seed);
    setResolvedSeeds(resolved);

    if (typeof window !== "undefined") {
      const v2Seed = resolved.v2 ?? resolved.base;
      window.__autocrmV2Seed = v2Seed;
      window.dispatchEvent(new CustomEvent("autocrm:v2SeedChange", { detail: { seed: v2Seed } }));
    }
  }, [seed]);

  const setSeed = useCallback(
    (newSeed: number) => {
      const clamped = clampBaseSeed(newSeed);
      if (clamped === seed) return;

      setSeedState(clamped);
      console.log(`[SeedContext:web5] Manual seed change to ${clamped}`);
    },
    [seed]
  );

  const getNavigationUrl = useCallback(
    (path: string) => {
      const [rawPath, rawQuery = ""] = path.split("?");
      const params = new URLSearchParams(rawQuery);
      params.set("seed", seed.toString());

      if (typeof window !== "undefined") {
        const url = new URL(path, window.location.origin);
        url.searchParams.set("seed", seed.toString());
        return `${url.pathname}${url.search}`;
      }

      const queryString = params.toString();
      return queryString ? `${rawPath}?${queryString}` : rawPath;
    },
    [seed]
  );

  return (
    <SeedContext.Provider
      value={{
        seed,
        setSeed,
        getNavigationUrl,
        resolvedSeeds,
      }}
    >
      <Suspense fallback={null}>
        <SeedInitializer onSeedFromUrl={handleSeedFromUrl} onSeedChange={handleSeedChange} />
      </Suspense>
      {children}
    </SeedContext.Provider>
  );
};

export const useSeed = () => {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error("useSeed must be used within a SeedProvider");
  }
  return context;
};
