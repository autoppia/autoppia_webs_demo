import { useMemo, useCallback } from "react";
import { getSeedLayout, getLayoutClasses } from "@/dynamic/v1-layouts";
import { useSeed as useSeedContext } from "@/context/SeedContext";
import { useV3Attributes } from "./useV3Attributes";

export function useSeedLayout() {
  const { resolvedSeeds } = useSeedContext();

  const layoutSeed = useMemo(() => {
    return resolvedSeeds.v1 ?? resolvedSeeds.base;
  }, [resolvedSeeds.v1, resolvedSeeds.base]);

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
  } = useV3Attributes();

  const layout = useMemo(() => {
    return getSeedLayout(layoutSeed);
  }, [layoutSeed]);

  const layoutClassesObj = useMemo(() => {
    return getLayoutClasses(layout);
  }, [layout]);

  const getElementAttributes = useCallback(
    (elementType: string, index: number = 0) => {
      if (isV3Active) {
        return getV3ElementAttributes(elementType, index);
      }
      return {
        id: `${elementType}-${index}`,
        "data-element-type": elementType,
      };
    },
    [isV3Active, getV3ElementAttributes]
  );

  const getElementXPath = useCallback(
    (elementType: string) => {
      if (isV3Active) {
        return getV3XPath(elementType);
      }
      return `//${elementType}[@id='${elementType}-0']`;
    },
    [isV3Active, getV3XPath]
  );

  const generateId = useCallback(
    (context: string, index: number = 0) => {
      if (isV3Active) {
        return getV3Id(context, index);
      }
      return `${context}-${index}`;
    },
    [isV3Active, getV3Id]
  );

  const generateSeedClass = useCallback(
    (baseClass: string) => {
      if (!isV3Active) {
        return baseClass;
      }
      const activeSeed = isV3Active ? v3Seed : layoutSeed;
      return `${baseClass}-seed-${activeSeed}`;
    },
    [layoutSeed, isV3Active, v3Seed]
  );

  return {
    seed: layoutSeed,
    layout,
    layoutClasses: layoutClassesObj,
    v2Seed,
    v3Seed,
    getElementAttributes,
    getElementXPath,
    generateId,
    generateSeedClass,
    getText,
    getClass,
  };
}
