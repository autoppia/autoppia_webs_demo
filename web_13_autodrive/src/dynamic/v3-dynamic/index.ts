"use client";

import { useCallback, useMemo } from "react";
import type React from "react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";
import { useSeed } from "@/context/SeedContext";

/**
 * Compatibility hook used by existing components.
 * Internally relies on the unified dynamic system (V1/V3).
 */
export function useSeedLayout() {
  const dyn = useDynamicSystem();
  const { seed: contextSeed } = useSeed();

  const getText = useCallback(
    (key: string, fallback?: string) =>
      dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback ?? key),
    [dyn]
  );

  const getElementAttributes = useCallback(
    (key: string, index = 0) => ({
      id: dyn.v3.getVariant(`${key}-${index}`, ID_VARIANTS_MAP, `${key}-${index}`),
      "data-dyn-key": key,
      className: dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, ""),
    }),
    [dyn]
  );

  const generateId = useCallback(
    (key: string, index = 0) =>
      dyn.v3.getVariant(`${key}-${index}`, ID_VARIANTS_MAP, `${key}-${index}`),
    [dyn]
  );

  // Minimal layout structure to keep previous API stable
  const layout = useMemo(
    () => ({
      className: "",
      structure: {
        main: {
          layout: "columns",
          sections: ["hero", "booking", "map", "rides", "footer"],
        },
        header: { position: "top" },
        footer: { position: "bottom" },
      },
    }),
    []
  );

  return {
    seed: dyn.seed,
    v2Seed: contextSeed ?? dyn.seed,
    isDynamicEnabled: isV1Enabled() || isV3Enabled(),
    layout,
    getText,
    getElementAttributes,
    generateId,
    // Legacy helpers (no-op but keep signature intact)
    getLayoutClasses: () => "",
    generateSeedClass: () => "",
    applyCSSVariables: () => {},
    createDynamicStyles: () => ({} as React.CSSProperties),
  };
}

export default useSeedLayout;
