"use client";

import { createContext, useCallback, useContext, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  isSeedReady: boolean;
}

const SeedContext = createContext<SeedContextType>({
  seed: 1,
  setSeed: () => {},
  isSeedReady: false,
});

export function SeedProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <SeedProviderInner>{children}</SeedProviderInner>
    </Suspense>
  );
}

function SeedProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [seed, setSeedState] = useState(1);
  const [isSeedReady, setIsSeedReady] = useState(false);

  useEffect(() => {
    setSeedState(getSeedFromUrl());
    setIsSeedReady(true);
  }, [searchParams]);

  const setSeed = useCallback((newSeed: number) => {
    const clamped = clampSeed(newSeed);
    setSeedState(clamped);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("seed", String(clamped));
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <SeedContext.Provider value={{ seed, setSeed, isSeedReady }}>
      {children}
    </SeedContext.Provider>
  );
}

export function useSeed() {
  const ctx = useContext(SeedContext);
  if (!ctx) throw new Error("useSeed must be used within SeedProvider");
  return ctx;
}
