"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LayoutVariant, getLayoutVariant, getSeedFromUrl } from '@/library/layoutVariants';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';

interface LayoutContextType {
  currentVariant: LayoutVariant;
  seed: number;
  setSeed: (seed: number) => void;
  updateUrlManually: (seed: number) => void;
  getNavigationUrl: (path: string) => string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Initialize with seed from localStorage or URL
  const getInitialSeed = () => {
    if (typeof window === 'undefined') return 1;
    
    // Try URL first
    const urlSeed = getSeedFromUrl();
    if (urlSeed && urlSeed !== 1) {
      return urlSeed;
    }
    
    // Then try localStorage
    try {
      const stored = localStorage.getItem('automailSeed');
      if (stored) {
        const parsed = parseInt(stored, 10);
        return getEffectiveSeed(parsed);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return 1;
  };

  const [seed, setSeed] = useState(getInitialSeed);
  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(getInitialSeed()));
  const [isUserAction, setIsUserAction] = useState(false);

  // Initial URL reading - only run once
  useEffect(() => {
    const urlSeed = getSeedFromUrl();
    const effectiveSeed = getEffectiveSeed(urlSeed);
    
    // Save to localStorage
    try {
      localStorage.setItem('automailSeed', effectiveSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
    if (effectiveSeed !== seed) {
      setSeed(effectiveSeed);
      setCurrentVariant(getLayoutVariant(effectiveSeed));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Listen for URL changes (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const urlSeed = getSeedFromUrl();
      const effectiveSeed = getEffectiveSeed(urlSeed);
      // console.log('LayoutProvider: URL changed via browser navigation, new seed:', urlSeed, 'Effective seed:', effectiveSeed);
      if (effectiveSeed !== seed) {
        // This is not a user action, so don't set the flag
        setSeed(effectiveSeed);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [seed]);

  // Update URL when seed changes (but don't override manual URL changes)
  useEffect(() => {
    // console.log('LayoutProvider: Seed changed to:', seed, 'Is user action:', isUserAction);
    setCurrentVariant(getLayoutVariant(seed));
    
    // Only update URL if this was a user-initiated change and dynamic HTML is enabled
    if (isUserAction && typeof window !== 'undefined' && isDynamicModeEnabled()) {
      const url = new URL(window.location.href);
      
      if (seed === 1) {
        // For default variant, remove seed parameter
        url.searchParams.delete('seed');
      } else {
        // For non-default variants, add seed parameter
        url.searchParams.set('seed', seed.toString());
      }
      
      window.history.replaceState({}, '', url.toString());
      // console.log('LayoutProvider: User action - Updated URL to:', url.toString());
      
      // Reset the flag
      setIsUserAction(false);
    }
  }, [seed, isUserAction]);

  const handleSetSeed = (newSeed: number) => {
    // console.log('LayoutProvider: handleSetSeed called with:', newSeed);
    if (newSeed >= 1 && newSeed <= 300) {
      const effectiveSeed = getEffectiveSeed(newSeed);
      // console.log('LayoutProvider: Setting seed to:', effectiveSeed);
      setIsUserAction(true); // Mark this as a user action
      setSeed(effectiveSeed);
      
      // Persist to localStorage
      try {
        localStorage.setItem('automailSeed', effectiveSeed.toString());
      } catch (e) {
        // Ignore localStorage errors
      }
    } else {
      // console.log('LayoutProvider: Invalid seed value:', newSeed);
    }
  };

  const updateUrlManually = (newSeed: number) => {
    // console.log('LayoutProvider: Manual URL update called with:', newSeed);
    if (newSeed >= 1 && newSeed <= 300) {
      const effectiveSeed = getEffectiveSeed(newSeed);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        
        if (effectiveSeed === 1) {
          url.searchParams.delete('seed');
        } else {
          url.searchParams.set('seed', effectiveSeed.toString());
        }
        
        window.history.pushState({}, '', url.toString());
        // console.log('LayoutProvider: Manually updated URL to:', url.toString());
        
        // Update the seed state to match the URL (not a user action)
        setSeed(effectiveSeed);
        
        // Persist to localStorage
        try {
          localStorage.setItem('automailSeed', effectiveSeed.toString());
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    }
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

  return (
    <LayoutContext.Provider value={{ currentVariant, seed, setSeed: handleSetSeed, updateUrlManually, getNavigationUrl }}>
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
