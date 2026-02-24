"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, Suspense } from "react";
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

type SeedProviderProps = Readonly<{ children: React.ReactNode }>;

export const SeedProvider = ({ children }: SeedProviderProps) => {
  return (
    <Suspense fallback={children}>
      <SeedProviderInner>{children}</SeedProviderInner>
    </Suspense>
  );
};

function SeedProviderInner({ children }: SeedProviderProps) {
  const searchParams = useSearchParams();
  const [seed, setSeed] = useState<number>(DEFAULT_SEED);
  const [isSeedReady, setIsSeedReady] = useState<boolean>(false);

  // Source of truth: URL `?seed=` (clamped 1..999). If missing/invalid => 1.
  useEffect(() => {
    setSeed(getSeedFromUrl());
    setIsSeedReady(true);
  }, [searchParams]);

  // Optional: allow components to update seed and keep it in the URL.
  const setSeedFromChild = useCallback((newSeed: number) => {
    const clamped = clampSeed(newSeed);
    setSeed(clamped);
    if (globalThis.window !== undefined) {
      try {
        const url = new URL(globalThis.window.location.href);
        url.searchParams.set("seed", String(clamped));
        globalThis.window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      } catch {
        // ignore
      }
    }
  }, []);

  const getNavigationUrl = useCallback(
    (path: string): string => {
      if (!path) return path;
      if (path.startsWith("http")) return path;

      const currentParams =
        globalThis.window === undefined
          ? new URLSearchParams()
          : new URLSearchParams(globalThis.window.location.search);
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

  const value = useMemo(
    () => ({ seed, setSeed: setSeedFromChild, getNavigationUrl, isSeedReady }),
    [seed, setSeedFromChild, getNavigationUrl, isSeedReady]
  );
  return <SeedContext.Provider value={value}>{children}</SeedContext.Provider>;
}

export const useSeed = () => {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error("useSeed must be used within a SeedProvider");
  }
  return context;
};
