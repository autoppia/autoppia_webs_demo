/**
 * FLAGS - Enablement control for V1, V2, and V3
 *
 * V1: DOM structure (wrappers, decoys) - Breaks XPath
 * V2: Data loading - Loads different data subsets based on seed
 * V3: Attributes and text (IDs, classes, texts) - Anti-memorization
 */

import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

export function isV1Enabled(): boolean {
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1;
  const enabled = value === undefined ? true : value === "true" || value === "1";

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V1 está deshabilitado. Configura NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true para activarlo");
    }
  }

  return enabled;
}

export function isV3Enabled(): boolean {
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3;
  const enabled = value === undefined ? true : value === "true" || value === "1";

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V3 está deshabilitado. Configura NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true para activarlo");
    }
  }

  return enabled;
}

/**
 * Checks whether V2 AI generation mode is enabled
 * V2 AI generation generates data on-the-fly using OpenAI
 */
export function isV2AiGenerateEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE;
  const enabled = value === "true";
  return enabled;
}

/**
 * Checks whether V2 DB load mode is enabled
 * V2 DB mode loads pre-generated data from backend
 */
export function isV2DbLoadModeEnabled(): boolean {
  return isDbLoadModeEnabled();
}
