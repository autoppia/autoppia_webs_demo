/**
 * FLAGS - Enablement control for V1, V2, V3, and V4
 *
 * V1: DOM structure (wrappers, decoys) - Breaks XPath
 * V2: Data loading (dynamic data)
 * V3: Attributes and text (IDs, classes, texts) - Anti-memorization
 * V4: Randomized popups - Anti-memorization
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

let _v2Warned = false;

/**
 * Checks whether V2 is enabled
 * V2 fetches data from /datasets/load endpoint
 */
export function isV2Enabled(): boolean {
  // In Next.js, NEXT_PUBLIC_* variables are available on both server and client
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2;
  const enabled = value === "true" || value === true;

  // Debug in development (warn once per session to avoid console noise)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && !enabled && !_v2Warned) {
    _v2Warned = true;
    console.warn("[dynamic] V2 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V2=true");
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
  const enabled = value === "true" || value === true;

  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V3 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true");
    }
  }

  return enabled;
}

/**
 * Checks whether V4 is enabled
 * V4 shows randomized popups when enabled.
 * In development, enabled by default so popups work without env config.
 */
export function isV4Enabled(): boolean {
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V4;
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  // In dev, enable V4 by default so popups work without setting env
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") return true;
  return false;
}
