"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSeedLayout, SeedLayout, getEffectiveSeed, isDynamicEnabled } from '@/lib/seed-layout';

interface LayoutContextType extends SeedLayout {
  seed: number;
  isDynamicMode: boolean;
  getElementAttributes: (elementType: string, index?: number) => Record<string, string>;
  generateId: (context: string, index?: number) => string;
  generateSeedClass: (baseClass: string) => string;
  getNavigationUrl: (path: string) => string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Initialize seed from localStorage or URL
  const getInitialSeed = () => {
    if (typeof window === 'undefined') return 6;
    
    // Try URL first
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    if (seedParam) {
      const rawSeed = parseInt(seedParam, 10);
      return getEffectiveSeed(rawSeed);
    }
    
    // Then try localStorage
    try {
      const stored = localStorage.getItem('autodeliverySeed');
      if (stored) {
        const parsed = parseInt(stored, 10);
        return getEffectiveSeed(parsed);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return 6; // Default seed
  };

  const [layout, setLayout] = useState<SeedLayout>(getSeedLayout(getInitialSeed()));
  const [seed, setSeed] = useState(getInitialSeed);
  const [isDynamicMode, setIsDynamicMode] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    setIsDynamicMode(isDynamicEnabled());
    
    const updateLayout = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const seedParam = urlParams.get('seed');
      const rawSeed = seedParam ? parseInt(seedParam, 10) : seed; // Use current seed if no URL param
      const effectiveSeed = getEffectiveSeed(rawSeed);
      
      // Save to localStorage
      try {
        localStorage.setItem('autodeliverySeed', effectiveSeed.toString());
      } catch (e) {
        // Ignore localStorage errors
      }
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = (path: string): string => {
    // If path already has query params
    if (path.includes('?')) {
      // Check if seed already exists in the URL
      if (path.includes('seed=')) {
        return path;
      }
      return `${path}&seed=${seed}`;
    }
    // Add seed as first query param
    return `${path}?seed=${seed}`;
  };

  const value: LayoutContextType = {
    ...layout,
    seed,
    isDynamicMode,
    getElementAttributes,
    generateId,
    generateSeedClass,
    getNavigationUrl,
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
