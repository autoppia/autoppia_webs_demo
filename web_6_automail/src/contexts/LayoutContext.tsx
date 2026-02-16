"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getLayoutVariant, type LayoutVariant } from '@/dynamic/layout';
import { useSeed } from '@/context/SeedContext';

interface LayoutContextType {
  currentVariant: LayoutVariant;
  seed: number;
  setSeed: (seed: number) => void;
  updateUrlManually: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Use SeedContext for unified seed management
  const { seed: baseSeed, setSeed: setSeedInContext, getNavigationUrl: seedGetNavigationUrl } = useSeed();

  const [seed, setSeed] = useState(baseSeed);
  const currentVariant = useMemo(() => getLayoutVariant(seed), [seed]);

  // Sync with SeedContext - la seed se mantiene pero el layout siempre es seed=1
  useEffect(() => {
    setSeed(baseSeed);
  }, [baseSeed]);

  // LAYOUT FIJO - Siempre usar layout de seed=1

  const handleSetSeed = (newSeed: number) => {
    // Delegate clamp + URL update to SeedContext.
    setSeedInContext(newSeed);
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
