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
  getNavigationUrl: (path: string) => string;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  // Initialize seed from localStorage or URL
  const getInitialSeed = () => {
    if (typeof window === 'undefined') return 1;
    
    // Try URL first
    const urlSeed = getSeedFromUrl();
    if (urlSeed && urlSeed !== 1) {
      return urlSeed;
    }
    
    // Then try localStorage
    try {
      const stored = localStorage.getItem('autocalendarSeed');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 300) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return 1;
  };

  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(1));
  const [seed, setSeed] = useState(getInitialSeed);
  const [isDynamicHTMLEnabled, setIsDynamicHTMLEnabled] = useState(false);

  // Use the centralized seed layout logic instead of duplicating it

  const updateLayout = useCallback((newSeed: number) => {
    // Validate seed range (1-300)
    const validSeed = (newSeed >= 1 && newSeed <= 300) ? newSeed : 1;
    setSeed(validSeed);
    
    // Save to localStorage
    try {
      localStorage.setItem('autocalendarSeed', validSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
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
    
    // Get seed from URL or localStorage
    const urlSeed = getSeedFromUrl();
    const effectiveSeed = urlSeed;
    
    setSeed(effectiveSeed);
    
    // Save to localStorage
    try {
      localStorage.setItem('autocalendarSeed', effectiveSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Set layout based on dynamic HTML setting
    if (dynamicEnabled) {
      updateLayout(effectiveSeed);
    } else {
      // Always use default layout when dynamic HTML is disabled
      setCurrentVariant(getLayoutVariant(1));
    }
  }, [updateLayout]);

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
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
  }, [seed]);

  return (
    <LayoutContext.Provider
      value={{
        currentVariant,
        seed,
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
