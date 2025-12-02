"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { getSeedLayout, getLayoutVariant, isDynamicEnabled, type LayoutVariant } from '@/dynamic/v1-layouts';
import { useSeed as useSeedContext } from '@/context/SeedContext';

interface LayoutContextType {
  currentVariant: LayoutVariant;
  seed: number; // For backward compatibility, returns layoutSeed
  v2Seed: number | null;
  isDynamicHTMLEnabled: boolean;
  updateLayout: (seed: number) => void; // Deprecated, kept for backward compatibility
  getNavigationUrl: (path: string) => string;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  // Use SeedContext for unified seed management
  const { seed: baseSeed, resolvedSeeds, getNavigationUrl: seedGetNavigationUrl } = useSeedContext();
  
  // Use resolved v1 seed for layout
  const layoutSeed = useMemo(() => {
    return resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v1, resolvedSeeds.base]);
  
  const v2Seed = useMemo(() => {
    if (resolvedSeeds.v2 !== null && resolvedSeeds.v2 !== undefined) {
      return resolvedSeeds.v2;
    }
    if (resolvedSeeds.base !== null && resolvedSeeds.base !== undefined) {
      return resolvedSeeds.base;
    }
    return baseSeed ?? null;
  }, [resolvedSeeds.v2, resolvedSeeds.base, baseSeed]);
  
  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(1));
  const [isDynamicHTMLEnabled, setIsDynamicHTMLEnabled] = useState(false);

  // LAYOUT FIJO - Siempre usar Layout 1 (seed 1)
  // La seed se mantiene en URL para V2 y V3, pero el layout (V1) es siempre fijo
  useEffect(() => {
    setIsDynamicHTMLEnabled(false);
    setCurrentVariant(getLayoutVariant(1)); // Siempre usar layout de seed=1
  }, []);

  const updateLayout = useCallback((newSeed: number) => {
    // This is now handled by SeedContext.setSeed
    // But we keep this for backward compatibility
    // The actual seed update should be done via SeedContext
    console.warn("[LayoutContext] updateLayout called, but seed is now managed by SeedContext. Use SeedContext.setSeed instead.");
  }, []);

  // Helper function to generate navigation URLs with seed parameter
  // Delegates to SeedContext which handles unified seed preservation
  const getNavigationUrl = useCallback((path: string): string => {
    return seedGetNavigationUrl(path);
  }, [seedGetNavigationUrl]);

  return (
    <LayoutContext.Provider
      value={{
        currentVariant,
        seed: layoutSeed, // Return layoutSeed for backward compatibility
        v2Seed,
        isDynamicHTMLEnabled,
        updateLayout,
        getNavigationUrl,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = React.useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
