"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const DEFAULT_SEED = 1;

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  isSeedReady: boolean;
}

const SeedContext = createContext<SeedContextType>({
  seed: DEFAULT_SEED,
  setSeed: () => {},
  isSeedReady: false,
});

export function SeedProvider({ children }: { children: React.ReactNode }) {
  const [seed] = useState(DEFAULT_SEED);
  const setSeed = useCallback(() => {}, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("seed")) {
      url.searchParams.delete("seed");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  return (
    <SeedContext.Provider value={{ seed, setSeed, isSeedReady: true }}>
      {children}
    </SeedContext.Provider>
  );
}

export function useSeed() {
  const ctx = useContext(SeedContext);
  if (!ctx) throw new Error("useSeed must be used within SeedProvider");
  return ctx;
}
