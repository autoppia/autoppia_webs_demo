"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resolveSeeds, resolveSeedsSync, clampBaseSeed, type ResolvedSeeds } from "@/shared/seed-resolver";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  resolvedSeeds: ResolvedSeeds;
}

const DEFAULT_SEED = 1;

const SeedContext = createContext<SeedContextType>({
  seed: DEFAULT_SEED,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
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

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const [seed, setSeedState] = useState<number>(DEFAULT_SEED);
  const [resolvedSeeds, setResolvedSeeds] = useState<ResolvedSeeds>(() =>
    resolveSeedsSync(DEFAULT_SEED)
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = clampBaseSeed(Number.parseInt(saved, 10));
        setSeedState(parsed);
      }
    } catch (error) {
      console.error("Error loading seed:", error);
    }
    setIsInitialized(true);
  }, [isInitialized]);

  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      setSeedState(urlSeed);
      try {
        localStorage.setItem(STORAGE_KEY, urlSeed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncResolved = resolveSeedsSync(seed);
    setResolvedSeeds(syncResolved);
    console.log(
      "[autocinema][seeds]",
      `base=${syncResolved.base}`,
      `layout(v1)=${syncResolved.v1 ?? "disabled"}`,
      `data(v2)=${syncResolved.v2 ?? "disabled"}`,
      `v3=${syncResolved.v3 ?? "disabled"}`
    );
    resolveSeeds(seed)
      .then((resolved) => {
        if (!cancelled) {
          setResolvedSeeds(resolved);
          console.log(
            "[autocinema][seeds:update]",
            `base=${resolved.base}`,
            `layout(v1)=${resolved.v1 ?? "disabled"}`,
            `data(v2)=${resolved.v2 ?? "disabled"}`,
            `v3=${resolved.v3 ?? "disabled"}`
          );
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn("[autocinema] Seed resolver fallback:", error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [seed, searchParams]);

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
