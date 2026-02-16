"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clampBaseSeed } from "@/shared/seed-resolver";

declare global {
  interface Window {
    __INITIAL_SEED__?: number;
  }
}

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  isSeedReady: boolean;
}

const DEFAULT_SEED = 1;

const SeedContext = createContext<SeedContextType>({
  seed: DEFAULT_SEED,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  isSeedReady: false,
});

const STORAGE_KEY = "autodelivery_seed_base";

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
  initialSeed,
}: {
  children: React.ReactNode;
  initialSeed?: number;
}) => {
  return (
    <Suspense fallback={children}>
      <SeedProviderInner initialSeed={initialSeed}>{children}</SeedProviderInner>
    </Suspense>
  );
};

function SeedProviderInner({
  children,
  initialSeed,
}: {
  children: React.ReactNode;
  initialSeed?: number;
}) {
  const searchParams = useSearchParams();

  const getInitialSeed = (): number => {
    if (typeof window !== "undefined" && window.__INITIAL_SEED__ !== undefined) {
      const serverSeed = window.__INITIAL_SEED__;
      if (typeof serverSeed === "number" && Number.isFinite(serverSeed)) {
        return clampBaseSeed(serverSeed);
      }
    }
    if (initialSeed !== undefined) {
      return clampBaseSeed(initialSeed);
    }
    try {
      const urlSeed = searchParams.get("seed");
      if (urlSeed) {
        return clampBaseSeed(Number.parseInt(urlSeed, 10));
      }
    } catch {
      // useSearchParams can fail during SSR
    }
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlSeed = params.get("seed");
        if (urlSeed) {
          return clampBaseSeed(Number.parseInt(urlSeed, 10));
        }
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return clampBaseSeed(Number.parseInt(saved, 10));
        }
      } catch {
        // Ignore
      }
    }
    return DEFAULT_SEED;
  };

  const [seed, setSeedState] = useState<number>(getInitialSeed);
  const [isSeedReady, setIsSeedReady] = useState<boolean>(false);

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
      setIsSeedReady(true);
    }
  }, []);

  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsed = clampBaseSeed(Number.parseInt(urlSeed, 10));
      if (parsed !== seed) {
        setSeedState(parsed);
      }
      setIsSeedReady(true);
    } else {
      if (typeof window !== "undefined" && window.__INITIAL_SEED__ !== undefined) {
        const initial = clampBaseSeed(window.__INITIAL_SEED__);
        if (initial !== seed) {
          setSeedState(initial);
        }
      }
      setIsSeedReady(true);
    }
  }, [searchParams, seed]);

  useEffect(() => {
    setIsSeedReady(true);
  }, []);

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
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, isSeedReady }}>
      <SeedInitializer onSeedFromUrl={handleSeedFromUrl} />
      {children}
    </SeedContext.Provider>
  );
}

export const useSeed = () => {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error("useSeed must be used within a SeedProvider");
  }
  return context;
};
