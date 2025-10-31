// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { getSeedLayout, isDynamicEnabled } from './layouts';
import { getEffectiveSeed, getLayoutConfig } from '@/utils/dynamicDataProvider';
import { getTextForElement, type ElementKey } from '@/library/textVariants';

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState(getSeedLayout(1));
  const [isDynamicEnabledState, setIsDynamicEnabledState] = useState(false);

  useEffect(() => {
    // Check if dynamic HTML is enabled
    const dynamicEnabled = isDynamicEnabled();
    setIsDynamicEnabledState(dynamicEnabled);
    
    // Get seed from URL parameters or localStorage (prefer seed-structure)
    const searchParams = new URLSearchParams(window.location.search);
    const seedStructureParam = searchParams.get('seed-structure');
    const seedParam = seedStructureParam ?? searchParams.get('seed');
    
    let rawSeed = 1;
    
    if (seedParam) {
      // Priority 1: URL parameter
      rawSeed = parseInt(seedParam);
    } else {
      // Priority 2: localStorage
      try {
        const storedStructure = localStorage.getItem('autodriveSeedStructure');
        const stored = storedStructure ?? localStorage.getItem('autodriveSeed');
        if (stored) {
          rawSeed = parseInt(stored);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      // Priority 3: env default
      if (!Number.isFinite(rawSeed)) {
        const envDefault = parseInt(process.env.NEXT_PUBLIC_DEFAULT_SEED_STRUCTURE as string);
        if (Number.isFinite(envDefault)) rawSeed = envDefault as unknown as number;
      }
    }
    
    // Get effective seed (validates range and respects dynamic HTML setting)
    const effectiveSeed = getEffectiveSeed(rawSeed);
    setSeed(effectiveSeed);
    
    // Save to localStorage
    try {
      localStorage.setItem('autodriveSeedStructure', effectiveSeed.toString());
      localStorage.setItem('autodriveSeed', effectiveSeed.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
    
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

  // Function to get dynamic text for an element type with fallback
  const getText = useCallback((key: ElementKey, fallback: string): string => {
    if (!isDynamicEnabledState) return fallback;
    return getTextForElement(seed, key, fallback);
  }, [seed, isDynamicEnabledState]);

  // Helper function to generate navigation URLs with seed parameter
  const getNavigationUrl = useCallback((path: string): string => {
    // If path already has query params
    if (path.includes('?')) {
      // Check if seed already exists in the URL
      if (path.includes('seed-structure=') || path.includes('seed=')) {
        return path;
      }
      return `${path}&seed-structure=${seed}`;
    }
    // Add seed as first query param
    return `${path}?seed-structure=${seed}`;
  }, [seed]);

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
    createDynamicStyles,
    getNavigationUrl,
    getText,
  };
}
