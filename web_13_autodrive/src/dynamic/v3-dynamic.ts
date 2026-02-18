"use client";

import { useCallback } from "react";
import { useDynamicSystem, generateId as coreGenerateId } from "./shared/core";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "./v3";
import { isV1Enabled, isV3Enabled, isV4Enabled } from "./shared/flags";

/**
 * Compatibility hook for autodrive ride/trip pages.
 * Exposes getElementAttributes, getText, seed, isDynamicEnabled, and generateId
 * using the unified dynamic system (V1 + V3).
 */
export function useSeedLayout() {
  const dyn = useDynamicSystem();

  const getElementAttributes = useCallback(
    (key: string, index = 0) => {
      const baseKey = `${key}-${index}`;
      const primaryId = dyn.v3.getVariant(baseKey, ID_VARIANTS_MAP);
      const containerId = dyn.v3.getVariant(`${baseKey}-container`, ID_VARIANTS_MAP);
      const actionId = dyn.v3.getVariant(`${baseKey}-action`, ID_VARIANTS_MAP);
      const surfaceId = dyn.v3.getVariant(`${baseKey}-surface`, ID_VARIANTS_MAP);
      const controlId = dyn.v3.getVariant(`${baseKey}-control`, ID_VARIANTS_MAP);

      const baseClass = dyn.v3.getVariant(baseKey, CLASS_VARIANTS_MAP);
      const surfaceClass = dyn.v3.getVariant(`${baseKey}-surface`, CLASS_VARIANTS_MAP);
      const accentClass = dyn.v3.getVariant(`${baseKey}-accent`, CLASS_VARIANTS_MAP);
      const textClass = dyn.v3.getVariant(`${baseKey}-text`, CLASS_VARIANTS_MAP);
      const wrapClass = dyn.v3.getVariant(`${baseKey}-wrap`, CLASS_VARIANTS_MAP);

      return {
        id: primaryId,
        "data-dyn-id": containerId,
        "data-dyn-action": actionId,
        "data-surface-id": surfaceId,
        "data-control-id": controlId,
        "data-dyn-class": baseClass,
        "data-surface-class": surfaceClass,
        "data-accent-class": accentClass,
        "data-text-class": textClass,
        "data-wrap-class": wrapClass,
        "data-dyn-key": baseKey,
      };
    },
    [dyn]
  );

  const getText = useCallback(
    (key: string, fallback?: string) => {
      const baseText = dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback ?? key);
      return dyn.v3.getVariant(`${key}_copy`, TEXT_VARIANTS_MAP, baseText);
    },
    [dyn]
  );

  const generateId = useCallback(
    (key: string, prefix = "dyn") => coreGenerateId(dyn.seed, key, prefix),
    [dyn.seed]
  );

  const isDynamicEnabled =
    isV1Enabled() || isV3Enabled() || isV4Enabled();

  return {
    getElementAttributes,
    getText,
    seed: dyn.seed,
    isDynamicEnabled,
    generateId,
  };
}
