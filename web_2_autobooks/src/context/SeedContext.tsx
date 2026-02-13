"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clampBaseSeed } from "@/shared/seed-resolver";

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

const STORAGE_KEY = "autobooks_seed_base";

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

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={children}>
      <SeedProviderInner>{children}</SeedProviderInner>
    </Suspense>
  );
};

function SeedProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [seed, setSeedState] = useState<number>(DEFAULT_SEED);
  const [isSeedReady, setIsSeedReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSeedState(clampBaseSeed(Number.parseInt(saved, 10)));
        }
      } catch {
        // ignore
      }
    }
    setIsSeedReady(true);
  }, []);

  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      setSeedState(urlSeed);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, urlSeed.toString());
        } catch (error) {
          console.error("Error saving seed to localStorage:", error);
        }
      }
    }
    setIsSeedReady(true);
  }, []);

  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsed = clampBaseSeed(Number.parseInt(urlSeed, 10));
      if (parsed !== seed) setSeedState(parsed);
    }
    setIsSeedReady(true);
  }, [searchParams, seed]);

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
