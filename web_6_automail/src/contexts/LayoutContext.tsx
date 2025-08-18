"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { LayoutVariant, getLayoutVariant, getSeedFromUrl } from '@/library/layoutVariants';

interface LayoutContextType {
  currentVariant: LayoutVariant;
  seed: number;
  setSeed: (seed: number) => void;
  updateUrlManually: (seed: number) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // Initialize with the seed from URL immediately
  const initialSeed = typeof window !== 'undefined' ? getSeedFromUrl() : 1;
  const [seed, setSeed] = useState(initialSeed);
  const [currentVariant, setCurrentVariant] = useState<LayoutVariant>(getLayoutVariant(initialSeed));
  const [isUserAction, setIsUserAction] = useState(false);

  // Initial URL reading - only run once
  useEffect(() => {
    const urlSeed = getSeedFromUrl();
    console.log('LayoutProvider: Initial seed from URL:', urlSeed, 'Current seed state:', seed);
    if (urlSeed !== seed) {
      console.log('LayoutProvider: Updating seed from URL:', urlSeed);
      setSeed(urlSeed);
      setCurrentVariant(getLayoutVariant(urlSeed));
    } else {
      console.log('LayoutProvider: Seed already matches URL, no update needed');
    }
  }, []); // Empty dependency array - only run once on mount

  // Listen for URL changes (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const urlSeed = getSeedFromUrl();
      console.log('LayoutProvider: URL changed via browser navigation, new seed:', urlSeed);
      if (urlSeed !== seed) {
        // This is not a user action, so don't set the flag
        setSeed(urlSeed);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [seed]);

  // Update URL when seed changes (but don't override manual URL changes)
  useEffect(() => {
    console.log('LayoutProvider: Seed changed to:', seed, 'Is user action:', isUserAction);
    setCurrentVariant(getLayoutVariant(seed));
    
    // Only update URL if this was a user-initiated change
    if (isUserAction && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      
      if (seed === 1) {
        // For default variant, remove seed parameter
        url.searchParams.delete('seed');
      } else {
        // For non-default variants, add seed parameter
        url.searchParams.set('seed', seed.toString());
      }
      
      window.history.replaceState({}, '', url.toString());
      console.log('LayoutProvider: User action - Updated URL to:', url.toString());
      
      // Reset the flag
      setIsUserAction(false);
    }
  }, [seed, isUserAction]);

  const handleSetSeed = (newSeed: number) => {
    console.log('LayoutProvider: handleSetSeed called with:', newSeed);
    if (newSeed >= 1 && newSeed <= 10) {
      console.log('LayoutProvider: Setting seed to:', newSeed);
      setIsUserAction(true); // Mark this as a user action
      setSeed(newSeed);
    } else {
      console.log('LayoutProvider: Invalid seed value:', newSeed);
    }
  };

  const updateUrlManually = (newSeed: number) => {
    console.log('LayoutProvider: Manual URL update called with:', newSeed);
    if (newSeed >= 1 && newSeed <= 10) {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        
        if (newSeed === 1) {
          url.searchParams.delete('seed');
        } else {
          url.searchParams.set('seed', newSeed.toString());
        }
        
        window.history.pushState({}, '', url.toString());
        console.log('LayoutProvider: Manually updated URL to:', url.toString());
        
        // Update the seed state to match the URL (not a user action)
        setSeed(newSeed);
      }
    }
  };

  return (
    <LayoutContext.Provider value={{ currentVariant, seed, setSeed: handleSetSeed, updateUrlManually }}>
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