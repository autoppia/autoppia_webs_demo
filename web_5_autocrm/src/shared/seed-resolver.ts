/**
 * Seed Resolution System for web_5_autocrm
 * 
 * This module provides a unified seed resolution system that derives V1, V2, and V3 seeds
 * from a single base seed parameter (?seed=X).
 * 
 * The resolution is centralized in webs_server, but this client provides a local fallback.
 */

export interface ResolvedSeeds {
  base: number;
  v1: number | null;
  v2: number | null;
  v3: number | null;
}

/**
 * Clamp base seed to valid range (1-999)
 */
export function clampBaseSeed(seed: number, minVal: number = 1, maxVal: number = 999): number {
  if (seed < minVal) return minVal;
  if (seed > maxVal) return maxVal;
  return seed;
}

/**
 * Get API base URL from environment variables
 */
function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_URL || "http://localhost:8080";
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    (typeof window !== "undefined" && window.location.origin.includes("localhost")
      ? "http://localhost:8090"
      : "http://app:8080")
  );
}

/**
 * Parse enable_dynamic parameter from URL (e.g., ?enable_dynamic=v1,v2)
 */
function parseEnableDynamicFromUrl(): { v1: boolean; v2: boolean; v3: boolean } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("enable_dynamic");
  if (!raw) return null;

  const parts = raw.split(",").map((s) => s.trim().toLowerCase());
  return {
    v1: parts.includes("v1"),
    v2: parts.includes("v2"),
    v3: parts.includes("v3"),
  };
}

/**
 * Get enabled flags from environment variables
 */
function getEnabledFlagsFromEnv(): { v1: boolean; v2: boolean; v3: boolean } {
  if (typeof window === "undefined") {
    return {
      v1: (process.env.ENABLE_DYNAMIC_V1 || "").toLowerCase() === "true",
      v2: (process.env.ENABLE_DYNAMIC_V2_DB_MODE || "").toLowerCase() === "true",
      v3: (process.env.ENABLE_DYNAMIC_V3 || "").toLowerCase() === "true",
    };
  }

  return {
    v1:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 || process.env.ENABLE_DYNAMIC_V1 || "")
        .toLowerCase() === "true",
    v2:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
        process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
        "")
        .toLowerCase() === "true",
    v3:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 || process.env.ENABLE_DYNAMIC_V3 || "")
        .toLowerCase() === "true",
  };
}

/**
 * Get enabled flags (URL parameter takes priority over environment variables)
 */
function getEnabledFlagsInternal(): { v1: boolean; v2: boolean; v3: boolean } {
  const urlFlags = parseEnableDynamicFromUrl();
  if (urlFlags !== null) {
    return urlFlags;
  }
  return getEnabledFlagsFromEnv();
}

/**
 * Local seed resolution (fallback when API is unavailable)
 * Uses the same formulas as webs_server/src/seed_resolver.py
 */
function resolveSeedsLocal(
  baseSeed: number,
  enabledFlags?: { v1: boolean; v2: boolean; v3: boolean }
): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  const flags = enabledFlags || getEnabledFlagsInternal();

  const resolved: ResolvedSeeds = {
    base: safeSeed,
    v1: null,
    v2: null,
    v3: null,
  };

  // Same formulas as webs_server/src/seed_resolver.py
  if (flags.v1) {
    resolved.v1 = ((safeSeed * 29 + 7) % 300) + 1;
  }
  if (flags.v2) {
    resolved.v2 = ((safeSeed * 53 + 17) % 300) + 1;
  }
  if (flags.v3) {
    resolved.v3 = ((safeSeed * 71 + 3) % 100) + 1;
  }

  return resolved;
}

/**
 * Resolve seeds using centralized webs_server API.
 * Falls back to local calculation if API is unavailable.
 * 
 * Enabled flags are determined from URL parameter ?enable_dynamic=v1,v2
 * or from environment variables if URL parameter is not present.
 */
export async function resolveSeeds(baseSeed: number): Promise<ResolvedSeeds> {
  const safeSeed = clampBaseSeed(baseSeed);
  const enabledFlags = getEnabledFlagsInternal();

  // During SSR or if API URL is not available, use local fallback
  if (typeof window === "undefined") {
    return resolveSeedsLocal(safeSeed, enabledFlags);
  }

  try {
    const apiUrl = getApiBaseUrl();
    const url = new URL(`${apiUrl}/seeds/resolve`);
    url.searchParams.set("seed", safeSeed.toString());
    url.searchParams.set("v1_enabled", String(enabledFlags.v1));
    url.searchParams.set("v2_enabled", String(enabledFlags.v2));
    url.searchParams.set("v3_enabled", String(enabledFlags.v3));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Seed resolution API failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      base: data.base ?? safeSeed,
      v1: data.v1 ?? null,
      v2: data.v2 ?? null,
      v3: data.v3 ?? null,
    };
  } catch (error) {
    console.warn("[seed-resolver] API call failed, using local fallback:", error);
    return resolveSeedsLocal(safeSeed, enabledFlags);
  }
}

/**
 * Synchronous version for immediate use (uses local calculation).
 * Use this when you need seeds synchronously (e.g., during initial render).
 */
export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  return resolveSeedsLocal(safeSeed);
}

/**
 * Get enabled flags (for external use)
 */
export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean } {
  return getEnabledFlagsInternal();
}

