// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getSeedLayout } from '@/utils/seedLayout';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState(getSeedLayout(1));
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

  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicEnabled) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    // Generate dynamic XPath based on seed
    return `//${elementType}[@data-seed='${seed}']`;
  }, [seed, isDynamicEnabled]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string }>(elements: T[]) => {
    if (!isDynamicEnabled) {
      return elements;
    }
    // Simple reordering based on seed
    const reordered = [...elements];
    for (let i = 0; i < seed % elements.length; i++) {
      reordered.push(reordered.shift()!);
    }
    return reordered;
  }, [seed, isDynamicEnabled]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicEnabled) {
      return `${context}-${index}`;
    }
    return `${context}-${seed}-${index}`;
  }, [seed, isDynamicEnabled]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'checkbox') => {
    if (!isDynamicEnabled) {
      return '';
    }
    // Generate dynamic classes based on seed
    return `dynamic-${elementType} seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    if (!isDynamicEnabled) {
      return;
    }
    // Apply basic dynamic CSS variables
    element.style.setProperty('--seed', seed.toString());
    element.style.setProperty('--variant', (seed % 10).toString());
  }, [seed, isDynamicEnabled]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    return {
      id: layout.id,
      name: layout.name,
      description: layout.description,
      isDynamic: isDynamicEnabled,
      seed: seed
    };
  }, [layout, isDynamicEnabled, seed]);

  // Function to create dynamic styles
  const createDynamicStyles = useCallback(() => {
    if (!isDynamicEnabled) {
      return {};
    }
    
    return {
      // Dynamic properties based on seed
      '--dynamic-seed': seed,
      '--dynamic-variant': (seed % 10),
    } as React.CSSProperties;
  }, [seed, isDynamicEnabled]);

  // Function to generate seed-specific CSS class names
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabled) {
      return baseClass;
    }
    return `${baseClass} seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  return {
    seed,
    layout,
    isDynamicEnabled,
    getElementAttributes,
    getElementXPath,
    getLayoutClasses,
    generateId,
    generateSeedClass,
    applyCSSVariables,
    createDynamicStyles,
    getLayoutInfo,
    reorderElements
  };
}
