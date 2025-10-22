"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSeedLayout, SeedLayout, getEffectiveSeed, isDynamicEnabled } from '@/lib/seed-layout';

interface LayoutContextType extends SeedLayout {
  seed: number;
  isDynamicMode: boolean;
  getElementAttributes: (elementType: string, index?: number) => Record<string, string>;
  generateId: (context: string, index?: number) => string;
  generateSeedClass: (baseClass: string) => string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<SeedLayout>(getSeedLayout(6));
  const [seed, setSeed] = useState(6);
  const [isDynamicMode, setIsDynamicMode] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    setIsDynamicMode(isDynamicEnabled());
    
    const updateLayout = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const seedParam = urlParams.get('seed');
      const rawSeed = seedParam ? parseInt(seedParam, 10) : 6;
      const effectiveSeed = getEffectiveSeed(rawSeed);
      
      setSeed(effectiveSeed);
      setLayout(getSeedLayout(effectiveSeed));
    };

    // Set initial layout
    updateLayout();

    // Listen for URL changes
    const handlePopState = () => updateLayout();
    window.addEventListener('popstate', handlePopState);

    // Listen for pushState/replaceState changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      updateLayout();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      updateLayout();
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // Function to get element attributes with seed
  const getElementAttributes = (elementType: string, index: number = 0): Record<string, string> => {
    if (!isDynamicMode) {
      return {
        id: `${elementType}-${index}`,
        'data-element-type': elementType,
      };
    }
    
    return {
      id: `${elementType}-${seed}-${index}`,
      'data-seed': seed.toString(),
      'data-variant': (seed % 10).toString(),
      'data-element-type': elementType,
      'data-layout-id': layout.layoutId.toString(),
    };
  };

  // Function to generate element ID with seed
  const generateId = (context: string, index: number = 0) => {
    if (!isDynamicMode) {
      return `${context}-${index}`;
    }
    return `${context}-${seed}-${index}`;
  };

  // Function to generate seed-based class name
  const generateSeedClass = (baseClass: string) => {
    if (!isDynamicMode) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  };

  const value: LayoutContextType = {
    ...layout,
    seed,
    isDynamicMode,
    getElementAttributes,
    generateId,
    generateSeedClass,
  };

  return (
    <LayoutContext.Provider value={value}>
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
