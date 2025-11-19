"use client";

import { useMemo } from 'react';
import { getEffectiveLayoutConfig, type LayoutConfig } from './layouts';
import { useSeed as useSeedContext } from '@/context/SeedContext';

/**
 * Legacy hook for backward compatibility.
 * Now uses SeedContext internally.
 * 
 * @deprecated Use useSeed from @/context/SeedContext directly for new code
 */
export function useSeed(): { seed: number | undefined; layout: LayoutConfig; getNavigationUrl: (path: string) => string } {
  const { seed: baseSeed, resolvedSeeds, getNavigationUrl } = useSeedContext();
  
  // Use resolved v1 seed for layout, or base seed as fallback
  const layoutSeed = resolvedSeeds.v1 ?? baseSeed;
  
  const seed = useMemo(() => {
    // Return undefined if v1 is not enabled (for backward compatibility)
    if (resolvedSeeds.v1 === null) {
      return baseSeed >= 1 && baseSeed <= 300 ? baseSeed : undefined;
    }
    return layoutSeed >= 1 && layoutSeed <= 300 ? layoutSeed : undefined;
  }, [layoutSeed, baseSeed, resolvedSeeds.v1]);
  
  const layout = useMemo(() => getEffectiveLayoutConfig(seed), [seed]);
  
  return { seed, layout, getNavigationUrl };
}
