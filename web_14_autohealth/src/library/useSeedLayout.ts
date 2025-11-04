import { useCallback, useEffect, useState } from 'react';
import { getEffectiveSeed, isDynamicModeEnabled } from '../utils/dynamicDataProvider';
import { getTextForElement, type ElementKey } from './textVariants';

// Get a consistent but random-looking value based on seed and key
function getSeededValue(seed: number, key: string): number {
  const str = `${seed}-${key}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate multiple ID patterns based on seed
function generateElementId(seed: number, elementType: string, index: number = 0): string {
  const idPatterns = [
    `el-${elementType}-${index}-${seed}`,
    `${elementType}_${index}_${seed}`,
    `component-${elementType}-${index}-${getSeededValue(seed, elementType)}`,
    `${elementType}-item-${index}-${getSeededValue(seed, 'item')}`,
    `widget-${elementType}-${index}-${seed}`,
    `${elementType}${index}${seed}`,
    `ui-${elementType}-${index}-${getSeededValue(seed, 'ui')}`,
    `${elementType}-${getSeededValue(seed, elementType)}-${index}`,
    `element-${elementType}-${index}-${getSeededValue(seed, 'element')}`,
    `${elementType}-${index}-${getSeededValue(seed, 'id')}`
  ];
  
  const patternIndex = getSeededValue(seed, 'idPattern') % idPatterns.length;
  return idPatterns[patternIndex];
}

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    const enabled = isDynamicModeEnabled();
    setIsDynamicEnabled(enabled);

    const searchParams = new URLSearchParams(window.location.search);
    const seedStructure = searchParams.get('seed-structure');
    const rawSeed = seedStructure ?? searchParams.get('seed');
    const effective = getEffectiveSeed(rawSeed ? parseInt(rawSeed) : 1);
    setSeed(effective);
  }, []);

  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const base = { id: `${elementType}-${index}`, 'data-element-type': elementType } as Record<string, string>;
    if (!isDynamicEnabled) return base;
    const dynamicId = generateElementId(seed, elementType, index);
    return {
      ...base,
      id: dynamicId,
      'data-seed': String(seed),
      'data-variant': String(seed % 10),
      'data-xpath': `//${elementType}[@data-seed='${seed}']`
    };
  }, [seed, isDynamicEnabled]);

  const getElementXPath = useCallback((elementType: string) => {
    if (!isDynamicEnabled) return `//${elementType}[@id='${elementType}-0']`;
    return `//${elementType}[@data-seed='${seed}']`;
  }, [seed, isDynamicEnabled]);

  const reorderElements = useCallback(<T>(items: T[]) => {
    if (!isDynamicEnabled || items.length === 0) return items;
    const times = seed % items.length;
    if (times === 0) return items;
    const copy = [...items];
    for (let i = 0; i < times; i++) {
      // rotate right by 1 each step
      copy.unshift(copy.pop() as T);
    }
    return copy;
  }, [seed, isDynamicEnabled]);

  const generateId = useCallback((context: string, index: number = 0) => {
    if (!isDynamicEnabled) return `${context}-${index}`;
    return generateElementId(seed, context, index);
  }, [seed, isDynamicEnabled]);

  const generateSeedClass = useCallback((baseClass: string) => {
    if (!isDynamicEnabled) return baseClass;
    return `${baseClass}-seed-${seed}`;
  }, [seed, isDynamicEnabled]);

  const createDynamicStyles = useCallback((base: React.CSSProperties = {}) => {
    if (!isDynamicEnabled) return base;
    return { ...base, '--seed': String(seed), '--variant': String(seed % 10) } as React.CSSProperties;
  }, [seed, isDynamicEnabled]);

  const applyCSSVariables = useCallback((el: HTMLElement) => {
    if (!isDynamicEnabled) return;
    el.style.setProperty('--seed', String(seed));
    el.style.setProperty('--variant', String(seed % 10));
  }, [seed, isDynamicEnabled]);

  return {
    seed,
    isDynamicEnabled,
    getElementAttributes,
    getElementXPath,
    reorderElements,
    generateId,
    generateSeedClass,
    createDynamicStyles,
    applyCSSVariables,
    getText: (key: ElementKey, fallback: string) => {
      if (!isDynamicEnabled) return fallback;
      return getTextForElement(seed, key, fallback);
    },
  };
}


