"use client";

import { useEffect, useState, useCallback } from 'react';
import { getSeedLayout, SeedLayout, getEffectiveSeed, generateElementAttributes, isDynamicEnabled } from '@/dynamic/v1-layouts';

export function useSeedLayout() {
  const [layout, setLayout] = useState<SeedLayout>(getSeedLayout(6));
  const [seed, setSeed] = useState(6);
  const [isDynamicMode, setIsDynamicMode] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    setIsDynamicMode(isDynamicEnabled());
    
    const updateLayout = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const seedParam = urlParams.get('seed');
      const rawSeed = seedParam ? parseInt(seedParam, 10) : 6;
      const effectiveSeed = getEffectiveSeed(rawSeed);
      
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
  }, []);

  // Function to get element attributes with seed
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    return generateElementAttributes(elementType, seed, index);
  }, [seed]);

  // Function to generate element ID with seed
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicMode) {
      return `${context}-${index}`;
    }
    return `${context}-${seed}-${index}`;
  }, [seed, isDynamicMode]);

  // Function to generate seed-based class name
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicMode) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicMode]);

  return {
    ...layout,
    seed,
    isDynamicMode,
    getElementAttributes,
    generateId,
    generateSeedClass,
  };
} 