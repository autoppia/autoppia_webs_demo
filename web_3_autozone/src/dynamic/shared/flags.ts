/**
 * FLAGS - Enablement control for V1 and V3
 * 
 * V1: DOM structure (wrappers, decoys) - Breaks XPath
 * V3: Attributes and text (IDs, classes, texts) - Anti-memorization
 */

/**
 * Checks whether V1 is enabled
 * V1 adds wrappers and decoys to the DOM to break XPath
 */
export function isV1Enabled(): boolean {
  // In Next.js, NEXT_PUBLIC_* variables are available on both server and client
  const value = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 ?? "").toString().toLowerCase();
  const enabled = value === "true" || value === "1" || value === "yes" || value === "on";
  
  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V1 is disabled. To enable it, set NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true");
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
  const value = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 ?? "").toString().toLowerCase();
  const enabled = value === "true" || value === "1" || value === "yes" || value === "on";
  
  // Debug in development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V3 is disabled. To enable it, set NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true");
    }
  }
  
  return enabled;
}

