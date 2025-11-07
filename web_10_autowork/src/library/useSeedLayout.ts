// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getLayoutVariant } from './layoutVariants';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
import { getLayoutClasses } from '@/utils/seedLayout';
import { getSeedLayout, LayoutConfig } from './utils';

export function useSeedLayout() {
  const [seed, setSeed] = useState(36);
  const [layout, setLayout] = useState<LayoutConfig>(getSeedLayout(36));
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicModeEnabled();
    setIsDynamicEnabled(dynamicEnabled);
    
    // Get seed from URL parameters or localStorage
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    
    let rawSeed = 36;
    
    if (seedParam) {
      // Priority 1: URL parameter
      rawSeed = parseInt(seedParam);
    } else {
      // Priority 2: localStorage
      try {
        const stored = localStorage.getItem('autoworkSeed');
        if (stored) {
          rawSeed = parseInt(stored);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Get effective seed (validates range and respects dynamic HTML setting)
    const effectiveSeed = getEffectiveSeed(rawSeed);
    setSeed(effectiveSeed);
    
    // Save to localStorage
    try {
      localStorage.setItem('autoworkSeed', effectiveSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Update layout only if dynamic HTML is enabled
    if (dynamicEnabled) {
      setLayout(getSeedLayout(effectiveSeed));
    } else {
      // Use default layout when dynamic HTML is disabled
      setLayout(getSeedLayout(36));
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
      return getLayoutClasses(getLayoutConfig(36));
    }
    return getLayoutClasses(getLayoutConfig(seed));
  }, [seed, isDynamicEnabled]);

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

  return {
    seed,
    layout,
    setSeed,
    isDynamicEnabled,
    getElementAttributes,
    getXPathSelector,
    getLayoutClassesForSeed,
    getNavigationUrl,
  };
} 