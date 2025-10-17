// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getSeedLayout, isDynamicEnabled } from './layouts';
import { getEffectiveSeed, getLayoutConfig } from '@/utils/dynamicDataProvider';

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState(getSeedLayout(1));
  const [isDynamicEnabledState, setIsDynamicEnabledState] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicEnabled();
    setIsDynamicEnabledState(dynamicEnabled);
    
    // Get seed from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    const rawSeed = seedParam ? parseInt(seedParam) : 1;
    
    // Get effective seed (validates range and respects dynamic HTML setting)
    const effectiveSeed = getEffectiveSeed(rawSeed);
    setSeed(effectiveSeed);
    
    // Update layout only if dynamic HTML is enabled
    if (dynamicEnabled) {
      setLayout(getLayoutConfig(effectiveSeed));
    } else {
      // Use default layout when dynamic HTML is disabled
      setLayout(getLayoutConfig(1));
    }
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const baseAttrs = { 
      id: `${elementType}-${index}`, 
      'data-element-type': elementType 
    };
    
    if (!isDynamicEnabledState) {
      return baseAttrs;
    }
    
    // Generate dynamic attributes based on seed
    return { 
      ...baseAttrs,
      id: `${elementType}-${seed}-${index}`, 
      'data-seed': seed.toString(),
      'data-variant': (seed % 10).toString(),
      'data-xpath': `//${elementType}[@data-seed='${seed}']`
    };
  }, [seed, isDynamicEnabledState]);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicEnabledState) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    // Generate dynamic XPath based on seed
    return `//${elementType}[@data-seed='${seed}']`;
  }, [seed, isDynamicEnabledState]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string; type?: string }>(elements: T[]) => {
    if (!isDynamicEnabledState) {
      return elements;
    }
    // Simple reordering based on seed (cycle through elements)
    const reordered = [...elements];
    for (let i = 0; i < seed % elements.length; i++) {
      reordered.push(reordered.shift()!);
    }
    return reordered;
  }, [seed, isDynamicEnabledState]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicEnabledState) {
      return `${context}-${index}`;
    }
    return `${context}-${seed}-${index}`;
  }, [seed, isDynamicEnabledState]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'ride-card' | 'driver-card') => {
    if (!isDynamicEnabledState) {
      return '';
    }
    // Generate dynamic classes based on seed
    return `dynamic-${elementType} seed-${seed}`;
  }, [seed, isDynamicEnabledState]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    if (!isDynamicEnabledState) {
      return;
    }
    // Apply basic dynamic CSS variables
    element.style.setProperty('--seed', seed.toString());
    element.style.setProperty('--variant', (seed % 10).toString());
  }, [seed, isDynamicEnabledState]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    return {
      seed,
      layout,
      isDynamicEnabled: isDynamicEnabledState,
      layoutName: layout.name,
      structure: layout.structure,
      sections: layout.structure.main.sections
    };
  }, [seed, layout, isDynamicEnabledState]);

  // Function to generate a unique class name based on seed
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabledState) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicEnabledState]);

  // Function to create a dynamic style object
  const createDynamicStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    if (!isDynamicEnabledState) {
      return baseStyles;
    }
    return {
      ...baseStyles,
      '--seed': seed.toString(),
      '--variant': (seed % 10).toString()
    };
  }, [seed, isDynamicEnabledState]);

  return {
    seed,
    layout,
    isDynamicEnabled: isDynamicEnabledState,
    getElementAttributes,
    getElementXPath,
    reorderElements,
    generateId,
    getLayoutClasses,
    applyCSSVariables,
    getLayoutInfo,
    generateSeedClass,
    createDynamicStyles
  };
}
