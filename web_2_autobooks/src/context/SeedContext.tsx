"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resolveSeedsSync, clampBaseSeed, type ResolvedSeeds } from "@/shared/seed-resolver";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  resolvedSeeds: ResolvedSeeds;
  isSeedReady: boolean; // Indicates whether the seed is synchronized with the URL
}

const DEFAULT_SEED = 1;

const SeedContext = createContext<SeedContextType>({
  seed: DEFAULT_SEED,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  resolvedSeeds: resolveSeedsSync(DEFAULT_SEED),
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
  const [resolvedSeeds, setResolvedSeeds] = useState<ResolvedSeeds>(() => resolveSeedsSync(DEFAULT_SEED));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSeedReady, setIsSeedReady] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = clampBaseSeed(Number.parseInt(saved, 10));
          setSeedState(parsed);
        }
      } catch (error) {
        console.error("Error loading seed:", error);
      }
    }
    setIsInitialized(true);
    setIsSeedReady(true);
  }, [isInitialized]);

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
  }, []);

  useEffect(() => {
    const syncResolved = resolveSeedsSync(seed);
    setResolvedSeeds(syncResolved);
    console.log(
      "[autobooks][seeds]",
      `base=${syncResolved.base}`,
      `layout(v1)=${syncResolved.v1}`,
      `data(v2)=${syncResolved.v2}`,
      `v3=${syncResolved.v3}`
    );
  }, [seed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base ?? null;
    (window as any).__autobooksV2Seed = v2Seed;
    window.dispatchEvent(
      new CustomEvent("autobooks:v2SeedChange", { detail: { seed: v2Seed } })
    );
  }, [resolvedSeeds.v2, resolvedSeeds.base]);

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
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, resolvedSeeds, isSeedReady }}>
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
