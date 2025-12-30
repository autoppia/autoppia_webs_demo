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

const STORAGE_KEY = "autohealth_seed_base";

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

export const SeedProvider = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={children}>
    <SeedProviderInner>{children}</SeedProviderInner>
  </Suspense>
);

function SeedProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const initialSeed = typeof window !== "undefined" && (window as any).__INITIAL_SEED__
    ? clampBaseSeed(Number.parseInt((window as any).__INITIAL_SEED__, 10))
    : DEFAULT_SEED;
  const [seed, setSeedState] = useState(initialSeed);
  const [resolvedSeeds, setResolvedSeeds] = useState<ResolvedSeeds>(() => resolveSeedsSync(initialSeed));
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
      console.error("[autohealth][seed] Error loading from storage", error);
    }
    setIsInitialized(true);
  }, [isInitialized]);

  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      setSeedState(urlSeed);
      try {
        localStorage.setItem(STORAGE_KEY, urlSeed.toString());
      } catch (error) {
        console.error("[autohealth][seed] Error saving seed", error);
      }
    }
  }, []);

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
          console.warn("[autohealth][seed] Falling back to local resolver", error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [seed, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base ?? null;
    (window as any).__autohealthV2Seed = v2Seed;
    window.dispatchEvent(new CustomEvent("autohealth:v2SeedChange", { detail: { seed: v2Seed } }));
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
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, resolvedSeeds }}>
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
