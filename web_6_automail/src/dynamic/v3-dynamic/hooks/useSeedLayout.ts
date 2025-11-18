// src/library/useSeedLayout.ts
import { useMemo, useCallback } from 'react';
import { getLayoutVariant } from './layoutVariants';
import { getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
import { useSeed as useSeedContext } from '@/context/SeedContext';

export function useSeedLayout() {
  // Use SeedContext for unified seed management
  const { resolvedSeeds } = useSeedContext();
  
  // Use resolved v1 seed for layout
  const layoutSeed = useMemo(() => {
    return resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v1, resolvedSeeds.base]);
  
  // Use resolved v3 seed for dynamic (HTML/text), or v1 if v3 not enabled
  const dynamicSeed = useMemo(() => {
    return resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v3, resolvedSeeds.v1, resolvedSeeds.base]);
  
  const v2Seed = useMemo(() => {
    return resolvedSeeds.v2 ?? null;
  }, [resolvedSeeds.v2]);
  
  // Check if dynamic mode is enabled
  const isDynamicEnabled = isDynamicModeEnabled();
  
  const seed = useMemo(() => {
    if (!isDynamicEnabled) {
      return 1;
    }
    return layoutSeed;
  }, [isDynamicEnabled, layoutSeed]);
  
  const layout = useMemo(() => {
    if (!isDynamicEnabled) {
      return getLayoutVariant(1);
    }
    return getLayoutVariant(seed);
  }, [isDynamicEnabled, seed]);

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
      seed,
      layout,
      isDynamicEnabled,
      layoutType: layout.layout,
      xpaths: layout.xpaths,
      styles: layout.styles
    };
  }, [seed, layout, isDynamicEnabled]);

  // Function to generate a unique class name based on seed
  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabled) {
      return baseClass;
    }
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  // Function to create a dynamic style object
  const createDynamicStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    if (!isDynamicEnabled) {
      return baseStyles;
    }
    return {
      ...baseStyles,
      '--seed': seed.toString(),
      '--variant': (seed % 10).toString()
    };
  }, [seed, isDynamicEnabled]);

  return {
    seed,
    layout,
    isDynamicEnabled,
    v2Seed,
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
