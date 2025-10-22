"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { getEffectiveLayoutConfig, type LayoutConfig } from './layouts';

export function useSeed(): { seed: number | undefined; layout: LayoutConfig; getNavigationUrl: (path: string) => string } {
  const searchParams = useSearchParams();
  const [persistedSeed, setPersistedSeed] = useState<number | undefined>(undefined);
  
  // Initialize from localStorage on client-side
  useEffect(() => {
    try {
      const stored = localStorage.getItem('autoconnectSeed');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 300) {
          setPersistedSeed(parsed);
        }
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }, []);
  
  const seed = useMemo(() => {
    try {
      const seedParam = searchParams?.get('seed');
      if (seedParam) {
        const seedNumber = parseInt(seedParam, 10);
        const validSeed = isNaN(seedNumber) || seedNumber < 1 || seedNumber > 300 ? undefined : seedNumber;
        
        // Save to localStorage if valid
        if (validSeed && typeof window !== 'undefined') {
          try {
            localStorage.setItem('autoconnectSeed', validSeed.toString());
            setPersistedSeed(validSeed);
          } catch (e) {
            // Ignore localStorage errors
          }
        }
        
        return validSeed;
      }
      
      // Fall back to persisted seed if no URL parameter
      return persistedSeed;
    } catch (error) {
      // Fallback to persisted seed or undefined
      return persistedSeed;
    }
  }, [searchParams, persistedSeed]);
  
  const layout = useMemo(() => getEffectiveLayoutConfig(seed), [seed]);
  
  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = (path: string): string => {
    if (!seed) return path;
    
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
  
  return { seed, layout, getNavigationUrl };
} 