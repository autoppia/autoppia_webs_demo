/**
 * CORE - Base functions and primary useDynamicSystem() hook
 *
 * Core helpers for variants and the centralized hook
 */

"use client";

import { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { applyV1Wrapper } from "../v1/add-wrap-decoy";
import { isV3Enabled } from "./flags";
import { getVariant, ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "../v3/utils/variant-selector";
import { generateDynamicOrder } from "../v1/change-order-elements";
import { dynamicDataProvider } from "../v2/data-provider";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import type { ReactNode } from "react";

/**
 * Generates a deterministic hash for a string
 * Optimized version that avoids overly large numbers
 */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer (avoids overflow)
  }
  return Math.abs(hash);
}

/**
 * Selects the index of a variant based on seed and key
 * Internal helper used by getVariant to calculate which variant to use
 *
 * @param seed - The base seed (1-999)
 * @param key - Unique identifier for the component
 * @param count - Number of available variants (returns 0 to count-1)
 * @returns Variant index (0, 1, 2, ..., count-1)
 */
export function selectVariantIndex(seed: number, key: string, count: number): number {
  if (count <= 1) return 0;

  const combinedInput = `${key}:${seed}`;
  const combinedHash = hashString(combinedInput);

  return Math.abs(combinedHash) % count;
}

/**
 * Generates a unique ID based on seed and key
 */
export function generateId(seed: number, key: string, prefix = "dyn"): string {
  return `${prefix}-${key}-${Math.abs(seed + hashString(key)) % 9999}`;
}

/**
 * Centralized hook that unifies V1 (wrappers/decoy), V2 (data loading), and V3 (attributes/text)
 *
 * Usage:
 *   const dyn = useDynamicSystem();
 *   dyn.v1.addWrapDecoy()         // V1: Adds wrappers and decoys
 *   dyn.v1.changeOrderElements()  // V1: Changes element order
 *   dyn.v2.whenReady()            // V2: Wait for data to be ready
 *   dyn.v3.getVariant()           // V3: Gets variants (IDs, classes, texts)
 *
 * The seed is read automatically from SeedContext (which reads it from the URL).
 */
export function useDynamicSystem() {
  const { seed } = useSeed();

  return useMemo(() => ({
    seed,

    v1: {
      addWrapDecoy: (
        componentKey: string,
        children: ReactNode,
        reactKey?: string
      ) => applyV1Wrapper(seed, componentKey, children, reactKey),
      changeOrderElements: (key: string, count: number) =>
        generateDynamicOrder(seed, key, count),
    },

    /**
     * V2: Data loading
     * Provides access to dynamic data provider
     */
    v2: {
      /**
       * Wait for data to be ready
       * @returns Promise that resolves when data is loaded
       */
      whenReady: () => dynamicDataProvider.whenReady(),

      /**
       * Check if V2 is enabled
       */
      isEnabled: () => isDbLoadModeEnabled(),
    },

    v3: {
      getVariant: (
        key: string,
        variants?: Record<string, string[]>,
        fallback?: string
      ) => {
        if (!isV3Enabled() && fallback !== undefined) return fallback;
        if (!isV3Enabled()) return key;
        return getVariant(seed, key, variants, fallback);
      },
    },

    selectVariantIndex: (key: string, count: number) =>
      selectVariantIndex(seed, key, count),
  }), [seed]);
}
