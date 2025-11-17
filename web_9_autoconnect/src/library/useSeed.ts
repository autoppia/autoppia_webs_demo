"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { getEffectiveLayoutConfig, type LayoutConfig } from './layouts';

const isV2ModeEnabled =
  (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
    process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
    ''
  )
    .toString()
    .toLowerCase() === 'true';

export function useSeed(): { seed: number | undefined; layout: LayoutConfig; getNavigationUrl: (path: string) => string } {
  const searchParams = useSearchParams();
  const [persistedSeed, setPersistedSeed] = useState<number | undefined>(undefined);
  const [persistedV2Seed, setPersistedV2Seed] = useState<number | null>(null);
  
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

  useEffect(() => {
    if (!isV2ModeEnabled) return;
    try {
      const stored = localStorage.getItem('autoconnectV2Seed');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 300) {
          setPersistedV2Seed(parsed);
        }
      }
    } catch {
      // ignore storage failures
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

  const v2Seed = useMemo(() => {
    if (!isV2ModeEnabled) return null;
    try {
      const raw = searchParams?.get('v2-seed');
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 300) {
          return parsed;
        }
        return null;
      }
      return persistedV2Seed;
    } catch {
      return persistedV2Seed;
    }
  }, [searchParams, persistedV2Seed]);

  useEffect(() => {
    if (!isV2ModeEnabled || typeof window === 'undefined') return;
    if (v2Seed) {
      try {
        localStorage.setItem('autoconnectV2Seed', v2Seed.toString());
        setPersistedV2Seed(v2Seed);
      } catch {
        // ignore storage errors
      }
    }
  }, [v2Seed]);
  
  const layout = useMemo(() => getEffectiveLayoutConfig(seed), [seed]);

  const appendParam = useCallback((path: string, key: string, value: string | number) => {
    const [base, hash] = path.split('#', 2);
    const [pathname, query = ''] = base.split('?', 2);
    const params = new URLSearchParams(query);
    params.set(key, String(value));
    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ''}${hash ? `#${hash}` : ''}`;
  }, []);
  
  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
    let next = path;
    
    if (seed) {
      next = appendParam(next, 'seed', seed);
    }
    if (isV2ModeEnabled && v2Seed) {
      next = appendParam(next, 'v2-seed', v2Seed);
    }
    
    return next;
  }, [appendParam, seed, v2Seed]);
  
  return { seed, layout, getNavigationUrl };
}
