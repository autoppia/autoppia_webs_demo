"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";

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
  const [isSeedReady, setIsSeedReady] = useState<boolean>(false);

  // Source of truth: URL `?seed=` (clamped 1..999). If missing/invalid => 1.
  useEffect(() => {
    // Recompute whenever URL search params change.
    setSeedState(getSeedFromUrl());
    setIsSeedReady(true);
  }, [searchParams]);

  // Optional: allow components to update seed and keep it in the URL.
  const setSeed = useCallback((newSeed: number) => {
    const clamped = clampSeed(newSeed);
    setSeedState(clamped);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("seed", String(clamped));
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      } catch {
        // Ignore URL update failures.
      }
    }
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
