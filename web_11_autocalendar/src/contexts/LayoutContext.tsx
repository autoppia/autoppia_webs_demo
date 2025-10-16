"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LayoutVariant } from '@/library/layoutVariants';
import { getLayoutVariant } from '@/library/layoutVariants';
import { getSeedFromUrl, getSeedLayout } from '@/utils/seedLayout';
import { isDynamicEnabled } from '@/utils/seedLayout';

interface LayoutContextType {
  currentVariant: LayoutVariant;
  seed: number;
  isDynamicHTMLEnabled: boolean;
  updateLayout: (seed: number) => void;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(1));
  const [seed, setSeed] = useState(1);
  const [isDynamicHTMLEnabled, setIsDynamicHTMLEnabled] = useState(false);

  // Use the centralized seed layout logic instead of duplicating it

  const updateLayout = useCallback((newSeed: number) => {
    // Validate seed range (1-300)
    const validSeed = (newSeed >= 1 && newSeed <= 300) ? newSeed : 1;
    setSeed(validSeed);
    
    // Only update layout if dynamic HTML is enabled
    if (isDynamicHTMLEnabled) {
      // Use the centralized getSeedLayout function
      const seedLayoutConfig = getSeedLayout(validSeed);
      setCurrentVariant(getLayoutVariant(seedLayoutConfig.id));
    }
  }, [isDynamicHTMLEnabled]);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicEnabled();
    setIsDynamicHTMLEnabled(dynamicEnabled);
    
    // Get seed from URL
    const urlSeed = getSeedFromUrl();
    setSeed(urlSeed);
    
    // Set layout based on dynamic HTML setting
    if (dynamicEnabled) {
      updateLayout(urlSeed);
    } else {
      // Always use default layout when dynamic HTML is disabled
      setCurrentVariant(getLayoutVariant(1));
    }
  }, [updateLayout]);

  return (
    <LayoutContext.Provider
      value={{
        currentVariant,
        seed,
        isDynamicHTMLEnabled,
        updateLayout,
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
