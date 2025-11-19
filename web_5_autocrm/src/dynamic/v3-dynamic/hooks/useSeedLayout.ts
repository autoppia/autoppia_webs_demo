import { useMemo, useCallback } from 'react';
import {
  getLayoutVariant,
  generateElementAttributes,
  getXPathSelector,
  getElementOrder,
  generateCSSVariables,
  generateLayoutClasses
} from '@/dynamic/v1-layouts';
import { generateElementId } from '../utils/id-generator';
import { getLayoutConfig, isDynamicModeEnabled } from '@/dynamic/v2-data';
import { useSeed as useSeedContext } from '@/context/SeedContext';
import { useV3Attributes } from './useV3Attributes';

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

  const {
    v3Seed,
    isActive: isV3Active,
    getElementAttributes: getV3ElementAttributes,
    getXPath: getV3XPath,
    getId: getV3Id,
    getText,
    getClass
  } = useV3Attributes();
  
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
  
  const cssVariables = useMemo(() => {
    if (!isDynamicEnabled) {
      return generateCSSVariables(1);
    }
    return generateCSSVariables(seed);
  }, [isDynamicEnabled, seed]);

  // Function to generate element attributes for a specific element type
  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    if (isV3Active) {
      return getV3ElementAttributes(elementType, index);
    }
    if (!isDynamicEnabled) {
      return { id: `${elementType}-${index}`, 'data-element-type': elementType };
    }
    return generateElementAttributes(elementType, seed, index);
  }, [seed, isDynamicEnabled, isV3Active, getV3ElementAttributes]);

  // Function to get XPath selector for an element
  const getElementXPath = useCallback((elementType: string) => {
    if (isV3Active) {
      return getV3XPath(elementType);
    }
    if (!isDynamicEnabled) {
      return `//${elementType}[@id='${elementType}-0']`;
    }
    return getXPathSelector(elementType, seed);
  }, [seed, isDynamicEnabled, isV3Active, getV3XPath]);

  // Function to reorder elements
  const reorderElements = useCallback(<T extends { id?: string; name?: string }>(elements: T[]) => {
    if (!isDynamicEnabled) {
      return elements;
    }
    return getElementOrder(seed, elements);
  }, [seed, isDynamicEnabled]);

  // Function to generate element ID
  const generateId = useCallback((context: string, index: number = 0) => {
    if (isV3Active) {
      return getV3Id(context, index);
    }
    if (!isDynamicEnabled) {
      return `${context}-${index}`;
    }
    return generateElementId(seed, context, index);
  }, [seed, isDynamicEnabled, isV3Active, getV3Id]);

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
    if (!isDynamicEnabled && !isV3Active) {
      return baseClass;
    }
    const activeSeed = isV3Active ? v3Seed : seed;
    return `${baseClass}-seed-${activeSeed}`;
  }, [seed, isDynamicEnabled, isV3Active, v3Seed]);

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
    v2Seed,
    v3Seed,
    getElementAttributes,
    getElementXPath,
    reorderElements,
    generateId,
    getLayoutClasses,
    applyCSSVariables,
    getLayoutInfo,
    generateSeedClass,
    createDynamicStyles,
    getText,
    getClass
  };
}
