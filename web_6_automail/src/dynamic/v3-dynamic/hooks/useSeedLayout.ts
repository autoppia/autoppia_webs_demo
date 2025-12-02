import { useMemo, useCallback } from "react";
import {
  getLayoutVariant,
  generateElementAttributes,
  getXPathSelector,
  getElementOrder,
  generateElementId,
  generateCSSVariables,
  generateLayoutClasses,
} from "@/dynamic/v1-layouts";
import { getLayoutConfig, isDynamicModeEnabled } from "@/dynamic/v2-data";
import { useSeed as useSeedContext } from "@/context/SeedContext";
import { useV3Attributes } from "./useV3Attributes";

export function useSeedLayout() {
  const { resolvedSeeds } = useSeedContext();

  // LAYOUT FIJO - La seed se mantiene en URL para V2 (datos) y V3 (texto), pero el layout (V1) es siempre fijo
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
    getClass,
    getAriaLabel,
  } = useV3Attributes();

  const isDynamicEnabled = isDynamicModeEnabled();

  // LAYOUT FIJO - Siempre usar seed=1 para layout (V1)
  // La seed se mantiene en URL para V2 (datos) y V3 (texto)
  const seed = useMemo(() => {
    return 1; // Siempre fijo para layout
  }, []);

  const layout = useMemo(() => {
    return getLayoutVariant(1); // Siempre layout de seed=1
  }, []);

  const cssVariables = useMemo(() => {
    return generateCSSVariables(1); // Siempre CSS variables de seed=1
  }, []);

  const getElementAttributes = useCallback(
    (elementType: string, index: number = 0) => {
      if (isV3Active) {
        return getV3ElementAttributes(elementType, index);
      }
      if (!isDynamicEnabled) {
        return { id: `${elementType}-${index}`, "data-element-type": elementType };
      }
      return generateElementAttributes(elementType, seed, index);
    },
    [seed, isDynamicEnabled, isV3Active, getV3ElementAttributes]
  );

  const getElementXPath = useCallback(
    (elementType: string) => {
      if (isV3Active) {
        return getV3XPath(elementType);
      }
      if (!isDynamicEnabled) {
        return `//${elementType}[@id='${elementType}-0']`;
      }
      return getXPathSelector(elementType, seed);
    },
    [seed, isDynamicEnabled, isV3Active, getV3XPath]
  );

  const reorderElements = useCallback(
    <T extends { id?: string; name?: string }>(elements: T[]) => {
      if (!isDynamicEnabled) {
        return elements;
      }
      return getElementOrder(seed, elements);
    },
    [seed, isDynamicEnabled]
  );

  const generateId = useCallback(
    (context: string, index: number = 0) => {
      if (isV3Active) {
        return getV3Id(context, index);
      }
      if (!isDynamicEnabled) {
        return `${context}-${index}`;
      }
      return generateElementId(seed, context, index);
    },
    [seed, isDynamicEnabled, isV3Active, getV3Id]
  );

  const getLayoutClasses = useCallback(
    (elementType: "container" | "item" | "button" | "checkbox") => {
      if (!isDynamicEnabled) {
        return "";
      }
      return generateLayoutClasses(seed, elementType);
    },
    [seed, isDynamicEnabled]
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
      seed,
      layout,
      cssVariables,
      isDynamicEnabled,
      layoutType: layout.layoutType,
      buttonLayout: layout.buttonLayout,
      labelStyle: layout.labelStyle,
      spacing: layout.spacing,
      elementOrder: layout.elementOrder,
    };
  }, [seed, layout, cssVariables, isDynamicEnabled]);

  const generateSeedClass = useCallback(
    (baseClass: string) => {
      if (!isDynamicEnabled && !isV3Active) {
        return baseClass;
      }
      const activeSeed = isV3Active ? v3Seed : seed;
      return `${baseClass}-seed-${activeSeed}`;
    },
    [seed, isDynamicEnabled, isV3Active, v3Seed]
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
    getClass,
    getAriaLabel,
  };
}
