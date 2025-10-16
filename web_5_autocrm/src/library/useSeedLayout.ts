// src/library/useSeedLayout.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getLayoutVariant, 
  generateElementAttributes, 
  getXPathSelector,
  getElementOrder,
  generateElementId,
  generateCSSVariables,
  generateLayoutClasses
} from './layoutVariants';
import { getEffectiveSeed, getLayoutConfig, isDynamicModeEnabled } from '@/utils/dynamicDataProvider';
import { getLayoutClasses } from '@/utils/seedLayout';

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState(getLayoutVariant(1));
  const [cssVariables, setCssVariables] = useState(generateCSSVariables(1));
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
    
    // Update layout and CSS variables only if dynamic HTML is enabled
    if (dynamicEnabled) {
      setLayout(getLayoutVariant(effectiveSeed));
      setCssVariables(generateCSSVariables(effectiveSeed));
    } else {
      // Use default layout when dynamic HTML is disabled
      setLayout(getLayoutVariant(1));
      setCssVariables(generateCSSVariables(1));
    }
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    if (!isDynamicEnabled) {
      return { id: `${elementType}-${index}`, 'data-element-type': elementType };
    }
    return generateElementAttributes(elementType, seed, index);
  }, [seed, isDynamicEnabled]);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicEnabled) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    return getXPathSelector(elementType, seed);
  }, [seed, isDynamicEnabled]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string }>(elements: T[]) => {
    if (!isDynamicEnabled) {
      return elements;
    }
    return getElementOrder(seed, elements);
  }, [seed, isDynamicEnabled]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicEnabled) {
      return `${context}-${index}`;
    }
    return generateElementId(seed, context, index);
  }, [seed, isDynamicEnabled]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'checkbox') => {
    if (!isDynamicEnabled) {
      return '';
    }
    return generateLayoutClasses(seed, elementType);
  }, [seed, isDynamicEnabled]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    if (!isDynamicEnabled) {
      return;
    }
    Object.entries(cssVariables).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }, [cssVariables, isDynamicEnabled]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    return {
      seed,
      layout,
      cssVariables,
      isDynamicEnabled,
      layoutType: layout.layoutType,
      buttonLayout: layout.buttonLayout,
      labelStyle: layout.labelStyle,
      spacing: layout.spacing,
      elementOrder: layout.elementOrder
    };
  }, [seed, layout, cssVariables, isDynamicEnabled]);

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
      ...Object.fromEntries(
        Object.entries(cssVariables).map(([key, value]) => [
          key.replace('--', ''),
          value
        ])
      )
    };
  }, [cssVariables, isDynamicEnabled]);

  return {
    seed,
    layout,
    cssVariables,
    isDynamicEnabled,
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