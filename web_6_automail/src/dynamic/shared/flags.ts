/**
 * FLAGS - Enablement control for V1, V2, and V3
 *
 * V1: DOM structure (wrappers, decoys) - Breaks XPath
 * V2: Data loading (dynamic data)
 * V3: Attributes and text (IDs, classes, texts) - Anti-memorization
 */

/**
 * Checks whether V1 is enabled
 * V1 adds wrappers and decoys to the DOM to break XPath
 */
export function isV1Enabled(): boolean {
  // In Next.js, NEXT_PUBLIC_* variables are available on both server and client
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1;
  const enabled = value === "true";

  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V1 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true");
    }
  }

  return enabled;
}

/**
 * Checks whether V2 is enabled
 * V2 fetches data from /datasets/load endpoint
 */
export function isV2Enabled(): boolean {
  // In Next.js, NEXT_PUBLIC_* variables are available on both server and client
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2;
  const enabled = value === "true";

  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V2 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V2=true");
    }
  }

  return enabled;
}

/**
 * Checks whether V3 is enabled
 * V3 changes IDs, classes, and texts to prevent memorization
 */
export function isV3Enabled(): boolean {
  // In Next.js, NEXT_PUBLIC_* variables are available on both server and client
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3;
  const enabled = value === "true";

  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V3 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true");
    }
  }

  return enabled;
}
