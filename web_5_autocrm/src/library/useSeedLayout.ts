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

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [layout, setLayout] = useState(getLayoutVariant(1));
  const [cssVariables, setCssVariables] = useState(generateCSSVariables(1));

  useEffect(() => {
    // Get seed from URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const seedParam = searchParams.get('seed');
    const seedValue = seedParam ? parseInt(seedParam) : 1;
    
    // Ensure seed is between 1 and 10
    const validSeed = Math.max(1, Math.min(10, seedValue));
    setSeed(validSeed);
    
    // Update layout and CSS variables
    setLayout(getLayoutVariant(validSeed));
    setCssVariables(generateCSSVariables(validSeed));
  }, []);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    return generateElementAttributes(elementType, seed, index);
  }, [seed]);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    return getXPathSelector(elementType, seed);
  }, [seed]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string }>(elements: T[]) => {
    return getElementOrder(seed, elements);
  }, [seed]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    return generateElementId(seed, context, index);
  }, [seed]);

  // Function to get layout classes for specific element types
  const getLayoutClasses = useCallback((elementType: 'container' | 'item' | 'button' | 'checkbox') => {
    return generateLayoutClasses(seed, elementType);
  }, [seed]);

  // Function to apply CSS variables to an element
  const applyCSSVariables = useCallback((element: HTMLElement) => {
    Object.entries(cssVariables).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }, [cssVariables]);

  // Function to get current layout information
  const getLayoutInfo = useCallback(() => {
    return {
      seed,
      layout,
      cssVariables,
      layoutType: layout.layoutType,
      buttonLayout: layout.buttonLayout,
      labelStyle: layout.labelStyle,
      spacing: layout.spacing,
      elementOrder: layout.elementOrder
    };
  }, [seed, layout, cssVariables]);

  // Function to generate a unique class name based on seed
  const generateSeedClass = useCallback((baseClass: string) => {
    return `${baseClass}-seed-${seed}`;
  }, [seed]);

  // Function to create a dynamic style object
  const createDynamicStyles = useCallback((baseStyles: React.CSSProperties = {}) => {
    return {
      ...baseStyles,
      ...Object.fromEntries(
        Object.entries(cssVariables).map(([key, value]) => [
          key.replace('--', ''),
          value
        ])
      )
    };
  }, [cssVariables]);

  return {
    seed,
    layout,
    cssVariables,
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