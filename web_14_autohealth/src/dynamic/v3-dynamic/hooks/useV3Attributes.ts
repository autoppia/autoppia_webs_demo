/**
 * useV3Attributes Hook (AutoHealth)
 *
 * Provides semantic IDs, class variants, copy variants and XPath helpers
 * so automated agents cannot rely on fixed DOM structures.
 */

import { useCallback, useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { generateElementId } from "../utils/id-generator";
import { getTextForElement } from "../utils/text-selector";
import { getClassForElement } from "../utils/class-selector";

const isDynamicEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 === "true";
};

export function useV3Attributes() {
  const { resolvedSeeds } = useSeed();

  const v3Seed = useMemo(() => {
    return resolvedSeeds.v3 ?? resolvedSeeds.v1 ?? resolvedSeeds.base ?? 1;
  }, [resolvedSeeds.v3, resolvedSeeds.v1, resolvedSeeds.base]);

  const isEnabled = isDynamicEnabled();
  const isActive = isEnabled && v3Seed > 0;

  const getElementAttributes = useCallback(
    (elementType: string, index: number = 0) => {
      const baseAttrs = {
        id: index > 0 ? `${elementType}-${index}` : elementType,
        "data-element-type": elementType,
      } as Record<string, string>;

      if (!isActive) {
        return baseAttrs;
      }

      const dynamicId = generateElementId(v3Seed, elementType, index);
      return {
        ...baseAttrs,
        id: dynamicId,
        "data-element-type": elementType,
        "data-seed": v3Seed.toString(),
        "data-variant": ((v3Seed - 1) % 10).toString(),
        "data-xpath": `//*[@data-element-type='${elementType}' and @data-seed='${v3Seed}']`,
      };
    },
    [isActive, v3Seed]
  );

  const getText = useCallback(
    (key: string, fallback: string) => {
      if (!isActive) return fallback;
      return getTextForElement(v3Seed, key, fallback);
    },
    [isActive, v3Seed]
  );

  const getClass = useCallback(
    (classType: string, fallback: string = "") => {
      if (!isActive) return fallback;
      return getClassForElement(v3Seed, classType, fallback);
    },
    [isActive, v3Seed]
  );

  const getId = useCallback(
    (elementType: string, index: number = 0) => {
      if (!isActive) {
        return index > 0 ? `${elementType}-${index}` : elementType;
      }
      return generateElementId(v3Seed, elementType, index);
    },
    [isActive, v3Seed]
  );

  const getXPath = useCallback(
    (elementType: string) => {
      if (!isActive) {
        return `//*[@data-element-type='${elementType}']`;
      }
      return `//*[@data-element-type='${elementType}' and @data-seed='${v3Seed}']`;
    },
    [isActive, v3Seed]
  );

  return {
    v3Seed,
    isEnabled,
    isActive,
    getElementAttributes,
    getText,
    getClass,
    getId,
    getXPath,
  };
}
