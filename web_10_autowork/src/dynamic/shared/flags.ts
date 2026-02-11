/**
 * FLAGS - Enablement control for V1, V2, and V3
 * 
 * V1: DOM structure (wrappers, decoys) - Breaks XPath
 * V2: Data loading (DB, AI, fallback)
 * V3: Attributes and text (IDs, classes, texts) - Anti-memorization
 */

/**
 * Checks whether V1 is enabled
 * V1 adds wrappers and decoys to the DOM to break XPath
 */
export function isV1Enabled(): boolean {
  // In Next.js, NEXT_PUBLIC_* variables are available on both server and client
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1;
  const enabled = value === "true" || value === true;
  
  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V1 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true");
    }
  }
  
  return enabled;
}

/**
 * Checks whether V2 AI generation is enabled
 * V2 AI generation creates data via AI endpoint
 */
export function isV2AiGenerateEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE ?? process.env.ENABLE_DYNAMIC_V2_AI_GENERATE;
  const enabled = value === "true" || value === true || value === "1" || value === 1;
  return enabled;
}

/**
 * Checks whether V2 DB load mode is enabled
 * V2 DB load mode loads data from database
 */
export function isV2DbLoadModeEnabled(): boolean {
  // This uses the same flag as the seeded-loader
  // Import it to avoid duplication
  try {
    const { isDbLoadModeEnabled } = require("@/shared/seeded-loader");
    return isDbLoadModeEnabled();
  } catch {
    return false;
  }
}

/**
 * Checks whether V3 is enabled
 * V3 changes IDs, classes, and texts to prevent memorization
 */
export function isV3Enabled(): boolean {
  // In Next.js, NEXT_PUBLIC_* variables are available on both server and client
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3;
  const enabled = value === "true" || value === true;
  
  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V3 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true");
    }
  }
  
  return enabled;
}
