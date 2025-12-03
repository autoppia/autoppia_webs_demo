"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getLayoutVariant, type LayoutVariant } from '@/dynamic/v1-layouts';
import { getEffectiveSeed } from '@/dynamic/v2-data';
import { useSeed } from '@/context/SeedContext';

declare global {
  interface Window {
    __automailV2Seed?: number | null;
  }
  interface WindowEventMap {
    "automail:v2SeedChange": CustomEvent<{ seed: number | null }>;
  }
}

interface LayoutContextType {
  currentVariant: LayoutVariant;
  seed: number;
  setSeed: (seed: number) => void;
  updateUrlManually: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
  v2Seed: number | null;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Use SeedContext for unified seed management
  const { seed: baseSeed, resolvedSeeds, setSeed: setSeedInContext, getNavigationUrl: seedGetNavigationUrl } = useSeed();
  // LAYOUT FIJO - La seed se mantiene en URL para V2 y V3, pero el layout (V1) es siempre fijo como seed=1
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  
  const [seed, setSeed] = useState(baseSeed);
  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(1));
  
  // Sync with SeedContext - la seed se mantiene pero el layout siempre es seed=1
  useEffect(() => {
    setSeed(baseSeed);
    setCurrentVariant(getLayoutVariant(1)); // Siempre usar layout de seed=1
  }, [baseSeed]);

  // Sync v2Seed to window for backward compatibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__automailV2Seed = v2Seed ?? null;
    window.dispatchEvent(new CustomEvent("automail:v2SeedChange", { detail: { seed: v2Seed ?? null } }));
    console.log("[LayoutContext] v2-seed set", { v2Seed });
  }, [v2Seed]);

  // LAYOUT FIJO - Siempre usar layout de seed=1

  const handleSetSeed = (newSeed: number) => {
    if (newSeed >= 1 && newSeed <= 300) {
      const effectiveSeed = getEffectiveSeed(newSeed);
      // Update SeedContext (which will update URL and localStorage)
      setSeedInContext(effectiveSeed);
    }
  };

  const updateUrlManually = (newSeed: number) => {
    // Delegate to SeedContext
    handleSetSeed(newSeed);
  };

  // Helper function to generate navigation URLs with seed parameter
  // Note: This is kept for backward compatibility, but SeedLink/useSeedRouter use SeedContext directly
  const getNavigationUrl = useCallback((path: string): string => {
    // Delegate to SeedContext's getNavigationUrl for consistency
    return seedGetNavigationUrl(path);
  }, [seedGetNavigationUrl]);

  return (
    <LayoutContext.Provider value={{
      currentVariant,
      seed,
      setSeed: handleSetSeed,
      updateUrlManually,
      getNavigationUrl,
      v2Seed,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
} 
