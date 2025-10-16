// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getLayoutVariant } from './layoutVariants';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
import { getLayoutClasses } from '@/utils/seedLayout';
import { getSeedLayout, LayoutConfig } from './utils';

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState<LayoutConfig>(getSeedLayout(1));
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);
    
    // Get seed from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    const rawSeed = seedParam ? parseInt(seedParam) : 1;
    
    // Get effective seed (validates range and respects dynamic HTML setting)
    const effectiveSeed = getEffectiveSeed(rawSeed);
    setSeed(effectiveSeed);
    
    // Update layout only if dynamic HTML is enabled
    if (dynamicEnabled) {
      setLayout(getSeedLayout(effectiveSeed));
    } else {
      // Use default layout when dynamic HTML is disabled
      setLayout(getSeedLayout(1));
    }
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    };
    
    if (!isDynamicEnabled) {
      return baseAttrs;
    }
    
    // Generate dynamic attributes based on seed
    return { 
      ...baseAttrs,
      id: `${elementType}-${seed}-${index}`, 
      'data-seed': seed.toString(),
      'data-variant': (seed % 10).toString()
    };
  }, [seed, isDynamicEnabled]);

  // Function to get XPath selector for an element
  const getXPathSelector = useCallback((elementType: string) => {
    if (!isDynamicEnabled) {
      return `//*[@data-element-type='${elementType}']`;
    }
    
    // Generate XPath with dynamic attributes for scraper confusion
    return `//*[@data-element-type='${elementType}' and @data-seed='${seed}']`;
  }, [seed, isDynamicEnabled]);

  // Function to get layout classes based on current seed
  const getLayoutClassesForSeed = useCallback(() => {
    if (!isDynamicEnabled) {
      return getLayoutClasses(getLayoutConfig(1));
    }
    return getLayoutClasses(getLayoutConfig(seed));
  }, [seed, isDynamicEnabled]);

  return {
    seed,
    layout,
    setSeed,
    isDynamicEnabled,
    getElementAttributes,
    getXPathSelector,
    getLayoutClassesForSeed,
  };
} 