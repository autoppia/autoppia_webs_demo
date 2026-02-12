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
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { clampBaseSeed, getSeedForLoad } from "@/shared/seed-resolver";

declare global {
  interface Window {
    __autolistV2Seed?: number | null;
  }
  interface WindowEventMap {
    "autolist:v2SeedChange": CustomEvent<{ seed: number | null }>;
  }
}

interface SeedContextType {
  seed: number;
  setSeed: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  /** Seed que se envía a /datasets/load: v2 activo → seed URL, si no → 1 */
  seedForData: number;
}

const SeedContext = createContext<SeedContextType>({
  seed: 1,
  setSeed: () => {},
  getNavigationUrl: (path: string) => path,
  seedForData: 1,
});

const DEFAULT_SEED = 1;

// Internal component that handles URL params
function SeedInitializer({
  onSeedFromUrl,
}: {
  onSeedFromUrl: (seed: number | null) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const urlSeed = searchParams.get("seed");
    if (urlSeed) {
      const parsedSeed = Number.parseInt(urlSeed, 10);
      if (Number.isNaN(parsedSeed)) {
        // Invalid seed, redirect to seed=1
        const params = new URLSearchParams(searchParams.toString());
        params.set("seed", "1");
        router.replace(`${pathname}?${params.toString()}`);
        onSeedFromUrl(1);
      } else {
        onSeedFromUrl(clampBaseSeed(parsedSeed));
      }
    } else {
      // No seed in URL, redirect to seed=1
      const params = new URLSearchParams(searchParams.toString());
      params.set("seed", "1");
      router.replace(`${pathname}?${params.toString()}`);
      onSeedFromUrl(1);
    }
    
    // Log enable_dynamic if present (user explicitly set it)
    const enableDynamic = searchParams.get("enable_dynamic");
    if (enableDynamic) {
      console.log("[SeedContext:web12] enable_dynamic from URL (user override):", enableDynamic);
    } else {
      console.log("[SeedContext:web12] No enable_dynamic in URL, using env vars as default");
    }
  }, [searchParams, onSeedFromUrl, router, pathname]);

  return null;
}

export const SeedProvider = ({ children }: { children: React.ReactNode }) => {
  const [seed, setSeedState] = useState<number>(() => DEFAULT_SEED);
  const [isInitialized, setIsInitialized] = useState(false);
  const [urlSeedProcessed, setUrlSeedProcessed] = useState(false);
  const seedForData = getSeedForLoad(seed);

  // Initialize seed from localStorage on mount (client-side only)
  useEffect(() => {
    if (isInitialized) return;
    
    // Try localStorage only on client-side
    if (typeof window !== "undefined") {
      try {
        const savedSeed = localStorage.getItem("autolist_seed_base");
        if (savedSeed) {
          const parsedSeed = clampBaseSeed(Number.parseInt(savedSeed, 10));
          setSeedState(parsedSeed);
          console.log(`[SeedContext:web12] Using seed from localStorage: ${parsedSeed}`);
        }
      } catch (error) {
        console.error("Error loading seed from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // Handle seed from URL changes (when URL changes after initial load)
  const handleSeedFromUrl = useCallback((urlSeed: number | null) => {
    if (urlSeed !== null) {
      console.log(`[SeedContext:web12] Seed changed in URL: ${urlSeed}`);
      setSeedState(urlSeed);
      setUrlSeedProcessed(true);
    } else if (urlSeedProcessed) {
      // URL seed was removed; keep current seed to avoid losing it mid-navigation
      console.log("[SeedContext:web12] Seed removed from URL, keeping current seed value");
    }
  }, [urlSeedProcessed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("autolist_seed_base", seed.toString());
      } catch (error) {
        console.error("Error saving seed to localStorage:", error);
      }
    }
  }, [seed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__autolistV2Seed = seedForData;
    window.dispatchEvent(new CustomEvent("autolist:v2SeedChange", { detail: { seed: seedForData } }));
  }, [seedForData]);

  const setSeed = useCallback((newSeed: number) => {
    setSeedState(clampBaseSeed(newSeed));
  }, []);

  // Helper function to generate navigation URLs with seed and enable_dynamic parameters
  const getNavigationUrl = useCallback((path: string): string => {
    if (!path) return path;
    if (path.startsWith("http")) return path;
    
    const currentParams = typeof window !== "undefined" 
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    
    // If path already has query params
    const [base, queryString] = path.split("?");
    const params = new URLSearchParams(queryString || "");
    
    // Always preserve seed
    params.set("seed", seed.toString());
    
    // ONLY preserve enable_dynamic if user explicitly set it in URL
    // If not in URL, don't add it (will use env vars as default)
    const enableDynamic = currentParams.get("enable_dynamic");
    if (enableDynamic) {
      // User explicitly set it, preserve it
      params.set("enable_dynamic", enableDynamic);
    }
    // If not present, don't add it - will use env vars
    
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }, [seed]);

  return (
    <SeedContext.Provider value={{ seed, setSeed, getNavigationUrl, seedForData }}>
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
