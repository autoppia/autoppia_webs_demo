"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSeedLayout, SeedLayout, isDynamicEnabled } from "@/dynamic/v1-layouts";
import { useSeed } from "@/context/SeedContext";

declare global {
  interface Window {
    __autodeliveryV2Seed?: number | null;
  }
  interface WindowEventMap {
    "autodelivery:v2SeedChange": CustomEvent<{ seed: number | null }>;
  }
}

interface LayoutContextType extends SeedLayout {
  seed: number;
  isDynamicMode: boolean;
  v2Seed: number | null;
  getElementAttributes: (elementType: string, index?: number) => Record<string, string>;
  generateId: (context: string, index?: number) => string;
  generateSeedClass: (baseClass: string) => string;
  getNavigationUrl: (path: string) => string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Use SeedContext for unified seed management
  const { seed: baseSeed, resolvedSeeds, getNavigationUrl: seedGetNavigationUrl } = useSeed();
  const layoutSeed = resolvedSeeds.v1 ?? baseSeed;
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  
  const [seed, setSeed] = useState(baseSeed);
  const [layout, setLayout] = useState<SeedLayout>(() => getSeedLayout(layoutSeed));
  const [isDynamicMode, setIsDynamicMode] = useState(false);

  useEffect(() => {
    setIsDynamicMode(isDynamicEnabled());
  }, []);

  // Sync with SeedContext
  useEffect(() => {
    setSeed(baseSeed);
    setLayout(getSeedLayout(layoutSeed));
  }, [baseSeed, layoutSeed]);

  // Sync v2Seed to window for backward compatibility
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.__autodeliveryV2Seed = v2Seed ?? null;
    window.dispatchEvent(new CustomEvent("autodelivery:v2SeedChange", { detail: { seed: v2Seed ?? null } }));
    console.log("[LayoutProvider] v2-seed", v2Seed);
  }, [v2Seed]);

  const getElementAttributes = (elementType: string, index: number = 0): Record<string, string> => {
    if (!isDynamicMode) {
      return {
        id: `${elementType}-${index}`,
        "data-element-type": elementType,
      };
    }
    return {
      id: `${elementType}-${seed}-${index}`,
      "data-seed": seed.toString(),
      "data-variant": (seed % 10).toString(),
      "data-element-type": elementType,
      "data-layout-id": layout.layoutId.toString(),
    };
  };

  const generateId = (context: string, index: number = 0) => {
    if (!isDynamicMode) {
      return `${context}-${index}`;
    }
    return `${context}-${seed}-${index}`;
  };

  const generateSeedClass = (baseClass: string) => {
    if (!isDynamicMode) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  };

  // Helper function to generate navigation URLs with seed parameter
  // Note: This is kept for backward compatibility, but SeedLink/useSeedRouter use SeedContext directly
  const getNavigationUrl = useCallback((path: string): string => {
    // Delegate to SeedContext's getNavigationUrl for consistency
    return seedGetNavigationUrl(path);
  }, [seedGetNavigationUrl]);

  const value: LayoutContextType = {
    ...layout,
    seed,
    isDynamicMode,
    v2Seed,
    getElementAttributes,
    generateId,
    generateSeedClass,
    getNavigationUrl,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
