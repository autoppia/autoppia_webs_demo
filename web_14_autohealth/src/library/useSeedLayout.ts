import type React from "react";
import { useCallback, useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { getLayoutConfig, getLayoutClasses } from "@/utils/seedLayout";
import { isDynamicModeEnabled } from "@/utils/dynamicDataProvider";

export function useSeedLayout() {
  const { resolvedSeeds } = useSeed();
  const isDynamicEnabled = isDynamicModeEnabled();
  const layoutSeed = resolvedSeeds.v1 ?? resolvedSeeds.base;
  const dynamicSeed = resolvedSeeds.v3 ?? layoutSeed;

  const layoutConfig = useMemo(() => getLayoutConfig(layoutSeed), [layoutSeed]);
  const layoutClasses = useMemo(() => getLayoutClasses(layoutConfig), [layoutConfig]);

  const reorderElements = useCallback(<T,>(items: T[]): T[] => {
    if (!isDynamicEnabled || items.length === 0) return items;
    const rotations = dynamicSeed % items.length;
    if (rotations === 0) return items;
    const copy = [...items];
    for (let i = 0; i < rotations; i++) {
      copy.unshift(copy.pop() as T);
    }
    return copy;
  }, [dynamicSeed, isDynamicEnabled]);

  const getElementAttributes = useCallback(
    (elementType: string, index: number = 0) => {
      if (!isDynamicEnabled) {
        return { id: `${elementType}-${index}`, "data-element-type": elementType };
      }
      return {
        id: `${elementType}-${dynamicSeed}-${index}`,
        "data-element-type": elementType,
        "data-seed": String(dynamicSeed),
        "data-variant": String(dynamicSeed % 10 || 10),
        "data-xpath": `//${elementType}[@data-seed='${dynamicSeed}']`,
      };
    },
    [dynamicSeed, isDynamicEnabled]
  );

  const getElementXPath = useCallback(
    (elementType: string) => {
      if (!isDynamicEnabled) {
        return `//${elementType}[@id='${elementType}-0']`;
      }
      return `//${elementType}[@data-seed='${dynamicSeed}']`;
    },
    [dynamicSeed, isDynamicEnabled]
  );

  const generateId = useCallback(
    (context: string, index: number = 0) => {
      if (!isDynamicEnabled) return `${context}-${index}`;
      return `${context}-${dynamicSeed}-${index}`;
    },
    [dynamicSeed, isDynamicEnabled]
  );

  const generateSeedClass = useCallback(
    (baseClass: string) => {
      if (!isDynamicEnabled) return baseClass;
      return `${baseClass}-seed-${dynamicSeed}`;
    },
    [dynamicSeed, isDynamicEnabled]
  );

  const createDynamicStyles = useCallback(
    (base: React.CSSProperties = {}) => {
      if (!isDynamicEnabled) return base;
      return { ...base, "--seed": String(dynamicSeed), "--variant": String(dynamicSeed % 10 || 10) } as React.CSSProperties;
    },
    [dynamicSeed, isDynamicEnabled]
  );

  const applyCSSVariables = useCallback(
    (element: HTMLElement) => {
      if (!isDynamicEnabled) return;
      element.style.setProperty("--seed", String(dynamicSeed));
      element.style.setProperty("--variant", String(dynamicSeed % 10 || 10));
    },
    [dynamicSeed, isDynamicEnabled]
  );

  return {
    seed: dynamicSeed,
    isDynamicEnabled,
    layoutConfig,
    layoutClasses,
    reorderElements,
    getElementAttributes,
    getElementXPath,
    generateId,
    generateSeedClass,
    createDynamicStyles,
    applyCSSVariables,
  };
}
