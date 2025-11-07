import { useCallback, useEffect, useState } from 'react';
import { getEffectiveSeed, isDynamicModeEnabled } from '../utils/dynamicDataProvider';

export function useSeedLayout() {
  const [seed, setSeed] = useState(1);
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);

  useEffect(() => {
    const enabled = isDynamicModeEnabled();
    setIsDynamicEnabled(enabled);

    const searchParams = new URLSearchParams(window.location.search);
    const rawSeed = searchParams.get('seed');
    const effective = getEffectiveSeed(rawSeed ? parseInt(rawSeed) : 1);
    setSeed(effective);
  }, []);

  const getElementAttributes = useCallback((elementType: string, index: number = 0) => {
    const base = { id: `${elementType}-${index}`, 'data-element-type': elementType } as Record<string, string>;
    if (!isDynamicEnabled) return base;
    return {
      ...base,
      id: `${elementType}-${seed}-${index}`,
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
    return `${context}-${seed}-${index}`;
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
  };
}


