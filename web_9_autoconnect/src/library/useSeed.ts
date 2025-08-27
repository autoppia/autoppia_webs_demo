"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { getSeedLayout, type LayoutConfig } from './layouts';

export function useSeed(): { seed: number | undefined; layout: LayoutConfig } {
  const searchParams = useSearchParams();
  
  const seed = useMemo(() => {
    try {
      const seedParam = searchParams?.get('seed');
      if (!seedParam) return undefined;
      
      const seedNumber = parseInt(seedParam, 10);
      return isNaN(seedNumber) || seedNumber < 1 || seedNumber > 10 ? undefined : seedNumber;
    } catch (error) {
      // Fallback to default layout if useSearchParams fails
      return undefined;
    }
  }, [searchParams]);
  
  const layout = useMemo(() => getSeedLayout(seed), [seed]);
  
  return { seed, layout };
} 