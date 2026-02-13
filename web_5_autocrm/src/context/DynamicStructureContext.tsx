"use client";

import type React from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP } from "@/dynamic/v3";

/**
 * Legacy compatibility wrapper for useDynamicStructure
 * Migrates old code to use the new unified useDynamicSystem hook
 *
 * @deprecated Use useDynamicSystem() directly instead
 */
export function DynamicStructureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

/**
 * @deprecated Use useDynamicSystem() directly instead
 * This is a compatibility wrapper that maps old API to new API
 */
export function useDynamicStructure() {
  const dyn = useDynamicSystem();

  return {
    getText: (key: string, fallback: string) =>
      dyn.v3.getVariant(key, undefined, fallback),
    getId: (key: string) =>
      dyn.v3.getVariant(key, ID_VARIANTS_MAP, key),
    getClass: (key: string, fallback: string = "") =>
      dyn.v3.getVariant(key, undefined, fallback),
    currentVariation: dyn.seed % 10 || 10,
    seedStructure: dyn.seed,
    isEnabled: true,
  };
}
