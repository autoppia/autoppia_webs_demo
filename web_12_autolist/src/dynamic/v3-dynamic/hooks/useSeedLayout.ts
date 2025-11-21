import type React from "react";
import { useMemo, useCallback } from "react";
import {
  getSeedLayout,
  getLayoutVariant,
  generateElementAttributes,
  getXPathSelector,
  getElementOrder,
  generateElementId,
  generateCSSVariables,
  generateLayoutClasses,
  isDynamicEnabled as isStructureDynamicEnabled,
} from "@/dynamic/v1-layouts";
import { useSeed as useSeedContext } from "@/context/SeedContext";
import { useV3Attributes } from "./useV3Attributes";

export function useSeedLayout() {
  const { resolvedSeeds, getNavigationUrl: seedGetNavigationUrl } =
    useSeedContext();

  const structureSeed = useMemo(() => {
    return resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v1, resolvedSeeds.base]);

  const dynamicSeed = useMemo(() => {
    return resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v3, resolvedSeeds.v1, resolvedSeeds.base]);

  const v2Seed = useMemo(() => {
    return resolvedSeeds.v2 ?? null;
  }, [resolvedSeeds.v2]);

  // Check if v1 is enabled - use structureDynamicEnabled check OR if v1 seed is resolved
  const isV1Enabled = resolvedSeeds.v1 !== null;
  const isDynamicEnabled = isStructureDynamicEnabled() || isV1Enabled;

  const layout = useMemo(() => {
    if (!isDynamicEnabled) {
      return getSeedLayout(1);
    }
    return getSeedLayout(structureSeed);
  }, [isDynamicEnabled, structureSeed]);

  const layoutVariant = useMemo(() => {
    if (!isDynamicEnabled) {
      return getLayoutVariant(1);
    }
    return getLayoutVariant(structureSeed);
  }, [isDynamicEnabled, structureSeed]);

  const cssVariables = useMemo(() => {
    if (!isDynamicEnabled) {
      return generateCSSVariables(1);
    }
    return generateCSSVariables(structureSeed);
  }, [isDynamicEnabled, structureSeed]);

  const {
    v3Seed,
    isActive: isV3Active,
    getElementAttributes: getV3Attributes,
    getXPath: getV3XPath,
    getId: getV3Id,
    getText,
    getClass,
  } = useV3Attributes();

  const getElementAttributes = useCallback(
    (elementType: string, index: number = 0) => {
      if (isV3Active) {
        return getV3Attributes(elementType, index);
      }
      if (!isDynamicEnabled) {
        return { id: `${elementType}-${index}`, "data-element-type": elementType };
      }
      // Use structureSeed (v1) for element attributes when v1 is enabled
      return generateElementAttributes(elementType, structureSeed, index);
    },
    [structureSeed, isDynamicEnabled, isV3Active, getV3Attributes]
  );

  const getElementXPath = useCallback(
    (elementType: string) => {
      if (isV3Active) {
        return getV3XPath(elementType);
      }
      if (!isDynamicEnabled) {
        return `//${elementType}[@id='${elementType}-0']`;
      }
      // Use structureSeed (v1) for xpath when v1 is enabled
      return getXPathSelector(elementType, structureSeed);
    },
    [structureSeed, isDynamicEnabled, isV3Active, getV3XPath]
  );

  const reorderElements = useCallback(
    <T extends { id?: string; name?: string }>(elements: T[]) => {
      if (!isDynamicEnabled || elements.length === 0) {
        return elements;
      }
      // Use getElementOrder from v1-layouts for proper seed-based shuffling
      return getElementOrder(structureSeed, elements);
    },
    [structureSeed, isDynamicEnabled]
  );

  const generateId = useCallback(
    (context: string, index: number = 0) => {
      if (isV3Active) {
        return getV3Id(context, index);
      }
      if (!isDynamicEnabled) {
        return `${context}-${index}`;
      }
      // Use structureSeed (v1) for element IDs when v1 is enabled
      return generateElementId(structureSeed, context, index);
    },
    [structureSeed, isDynamicEnabled, isV3Active, getV3Id]
  );

  const getLayoutClasses = useCallback(
    (elementType: "container" | "item" | "button" | "checkbox") => {
      if (!isDynamicEnabled) {
        return "";
      }
      return generateLayoutClasses(dynamicSeed, elementType);
    },
    [dynamicSeed, isDynamicEnabled]
  );

  const applyCSSVariables = useCallback(
    (element: HTMLElement) => {
      if (!isDynamicEnabled) {
        return;
      }
      Object.entries(cssVariables).forEach(([property, value]) => {
        element.style.setProperty(property, value);
      });
    },
    [cssVariables, isDynamicEnabled]
  );

  const getLayoutInfo = useCallback(() => {
    return {
      structureSeed,
      dynamicSeed,
      seed: dynamicSeed,
      layout,
      variant: layoutVariant,
      isDynamicEnabled,
    };
  }, [structureSeed, dynamicSeed, layout, layoutVariant, isDynamicEnabled]);

  const generateSeedClass = useCallback(
    (baseClass: string) => {
      if (!isDynamicEnabled && !isV3Active) {
        return baseClass;
      }
      const activeSeed = isV3Active ? v3Seed : dynamicSeed;
      return `${baseClass}-seed-${activeSeed}`;
    },
    [dynamicSeed, isDynamicEnabled, isV3Active, v3Seed]
  );

  const createDynamicStyles = useCallback(
    (baseStyles: React.CSSProperties = {}) => {
      if (!isDynamicEnabled) {
        return baseStyles;
      }
      return {
        ...baseStyles,
        ...Object.fromEntries(
          Object.entries(cssVariables).map(([key, value]) => [
            key.replace("--", ""),
            value,
          ])
        ),
      };
    },
    [cssVariables, isDynamicEnabled]
  );

  const getNavigationUrl = useCallback(
    (path: string) => seedGetNavigationUrl(path),
    [seedGetNavigationUrl]
  );

  return {
    seed: dynamicSeed,
    structureSeed,
    dynamicSeed,
    v2Seed,
    layout,
    layoutVariant,
    cssVariables,
    isDynamicEnabled,
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
    getClass,
    getNavigationUrl,
  };
}
