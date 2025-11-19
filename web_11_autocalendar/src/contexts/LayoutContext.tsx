"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { LayoutVariant } from '@/library/layoutVariants';
import { getLayoutVariant } from '@/library/layoutVariants';
import { getSeedLayout } from '@/dynamic/v1-layouts';
import { isDynamicEnabled } from '@/dynamic/v1-layouts';
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
    return resolvedSeeds.v2 ?? null;
  }, [resolvedSeeds.v2]);
  
  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(1));
  const [isDynamicHTMLEnabled, setIsDynamicHTMLEnabled] = useState(false);

  // Update layout when seed changes
  useEffect(() => {
    const dynamicEnabled = isDynamicEnabled();
    setIsDynamicHTMLEnabled(dynamicEnabled);

    if (dynamicEnabled && resolvedSeeds.v1 !== null) {
      // Use the centralized getSeedLayout function
      const seedLayoutConfig = getSeedLayout(layoutSeed);
      setCurrentVariant(getLayoutVariant(seedLayoutConfig.id));
    } else {
      setCurrentVariant(getLayoutVariant(1));
    }
  }, [layoutSeed, resolvedSeeds.v1]);

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
