"use client";

import type React from "react";
import { useMemo } from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

type DynamicAttrs = {
  id?: string;
  className?: string;
};

/**
 * Backwards-compatible hook for legacy dynamic usage.
 * Internally routes to the unified dynamic system (V1 + V3).
 */
export function useSeedLayout() {
  const dyn = useDynamicSystem();

  const wrapWithV1 = (key: string, children: React.ReactNode, reactKey?: string) =>
    dyn.v1.addWrapDecoy(key, children, reactKey);

  const reorderElements = <T,>(items: T[]): T[] => {
    if (!items || items.length === 0) return items;
    const order = dyn.v1.changeOrderElements(`order-${items.length}`, items.length);
    return order.map((idx) => items[idx] ?? items[0]);
  };

  const getId = (key: string, index = 0) =>
    dyn.v3.getVariant(`${key}-${index}`, ID_VARIANTS_MAP, `${key}-${index}`);

  const getClass = (key: string, fallback = "") =>
    dyn.v3.getVariant(key, CLASS_VARIANTS_MAP, fallback || key);

  const getText = (key: string, fallback: string) =>
    dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);

  const getElementAttributes = (elementType: string, index = 0): DynamicAttrs => ({
    id: getId(elementType, index),
    className: getClass(elementType, ""),
  });

  const generateId = (key: string, index = 0) => getId(key, index);

  const generateSeedClass = (base: string) => `${base}-${dyn.seed}`;

  const createDynamicStyles = (style?: React.CSSProperties) => style ?? {};

  const applyCSSVariables = (node: HTMLElement | null) => node;

  return useMemo(
    () => ({
      seed: dyn.seed,
      wrapWithV1,
      reorderElements,
      getId,
      getClass,
      getText,
      getElementAttributes,
      generateId,
      generateSeedClass,
      createDynamicStyles,
      applyCSSVariables,
    }),
    [dyn.seed],
  );
}
