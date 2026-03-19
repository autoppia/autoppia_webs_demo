/**
 * CORE - Base functions and primary useDynamicSystem() hook
 *
 * Core helpers for variants and the centralized hook.
 * Pattern matches web_1_autocinema / web_2_autobooks.
 */

"use client";

import { useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { applyV1Wrapper } from "../v1/add-wrap-decoy";
import { generateDynamicOrder } from "../v1/change-order-elements";
import { getVariant } from "../v3/utils/variant-selector";
import { isV1Enabled, isV2Enabled, isV3Enabled, isV4Enabled } from "./flags";
import type { ReactNode } from "react";

// ============================================================================
// BASE FUNCTIONS
// ============================================================================

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

  // Combine seed and key into a single string and hash it
  // This ensures each (seed, key) combination produces a unique hash
  const combinedInput = `${key}:${seed}`;
  const combinedHash = hashString(combinedInput);

  // Reduce the hash to the available variant range
  // Use direct modulus for maximum distribution
  return Math.abs(combinedHash) % count;
}

/**
 * Generates a unique ID based on seed and key
 */
export function generateId(seed: number, key: string, prefix = "dyn"): string {
  return `${prefix}-${key}-${Math.abs(seed + hashString(key)) % 9999}`;
}

// ============================================================================
// MAIN HOOK: useDynamicSystem()
// ============================================================================

/**
 * Centralized hook that unifies V1 (wrappers/decoy), V2 (data loading), and V3 (attributes/text)
 *
 * Usage:
 *   const dyn = useDynamicSystem();
 *   dyn.v1.addWrapDecoy()         // V1: Adds wrappers and decoys
 *   dyn.v1.changeOrderElements()  // V1: Changes element order
 *   dyn.v2.isEnabled()            // V2: Check if V2 is enabled
 *   dyn.v3.getVariant()           // V3: Gets variants (IDs, classes, texts)
 *
 * When V1/V2/V3 are OFF, behavior falls back to seed=1 (original structure/data/variants).
 */
export function useDynamicSystem() {
  const { seed: baseSeed } = useSeed();

  return useMemo(
    () => ({
      seed: baseSeed,

      v1: {
        addWrapDecoy: (
          componentKey: string,
          children: ReactNode,
          reactKey?: string
        ) => {
          let effectiveSeed = baseSeed;
          if (!isV1Enabled()) effectiveSeed = 1;
          return applyV1Wrapper(effectiveSeed, componentKey, children, reactKey);
        },
        changeOrderElements: (key: string, count: number) => {
          let effectiveSeed = baseSeed;
          if (!isV1Enabled()) effectiveSeed = 1;
          return generateDynamicOrder(effectiveSeed, key, count);
        },
      },

      v2: {
        isEnabled: () => isV2Enabled(),
      },

      v3: {
        getVariant: (
          key: string,
          variants?: Record<string, string[]>,
          fallback?: string
        ) => {
          let effectiveSeed = baseSeed;
          if (!isV3Enabled()) effectiveSeed = 1;
          return getVariant(effectiveSeed, key, variants, fallback);
        },
      },

      v4: {
        isEnabled: () => isV4Enabled(),
      },

      selectVariantIndex: (key: string, count: number) =>
        selectVariantIndex(baseSeed, key, count),
    }),
    [baseSeed]
  );
}
