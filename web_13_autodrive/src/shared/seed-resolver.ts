/**
 * Centralized seed resolution service client.
 * Always calls webs_server API to resolve seeds - no local fallback.
 * 
 * Supports enable_dynamic URL parameter: ?enable_dynamic=v1,v2
 */

const BOOL_TRUE = ["true", "1", "yes", "y"];

const boolFromEnv = (value?: string | undefined | null): boolean => {
  if (!value) return false;
  return BOOL_TRUE.includes(value.toLowerCase());
};

/**
 * Parse enable_dynamic parameter from URL (e.g., "v1", "v2", "v1,v2", "v1,v2,v3")
 */
function parseEnableDynamicFromUrl(): { v1: boolean; v2: boolean; v3: boolean } | null {
  if (typeof window === "undefined") return null;
  
  const params = new URLSearchParams(window.location.search);
  const enableDynamic = params.get("enable_dynamic");
  
  if (!enableDynamic) return null;
  
  const parts = enableDynamic.toLowerCase().split(",").map(s => s.trim());
  return {
    v1: parts.includes("v1"),
    v2: parts.includes("v2"),
    v3: parts.includes("v3"),
  };
}

/**
 * Get enabled flags from URL parameter or environment variables.
 * Priority: URL parameter > Environment variables
 * 
 * If enable_dynamic is in URL, use it.
 * If not in URL, use environment variables (default deployment config).
 */
function getEnabledFlagsInternal(): { v1: boolean; v2: boolean; v3: boolean } {
  // First, try to get from URL parameter (user explicitly set it)
  const urlFlags = parseEnableDynamicFromUrl();
  if (urlFlags) {
    return { v1: false, v2: urlFlags.v2, v3: urlFlags.v3 };
  }
  
  // Fallback to environment variables (deployment default)
  // v1 disabled by default
  return {
    v1: false,
    v2: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2) ||
        boolFromEnv(process.env.ENABLE_DYNAMIC_V2),
    v3: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) ||
        boolFromEnv(process.env.ENABLE_DYNAMIC_V3),
  };
}

export type ResolvedSeeds = {
  base: number;
  v1: number | null;
  v2: number | null;
  v3: number | null;
};

const BASE_SEED = {
  min: 1,
  max: 999,
  defaultValue: 1,
};

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const origin = typeof window !== "undefined" ? window.location?.origin : undefined;
  const envIsLocal = envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"));
  const originIsLocal = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"));

  if (envUrl && (!(envIsLocal) || originIsLocal)) {
    return envUrl;
  }
  if (origin) {
    return `${origin}/api`;
  }
  return envUrl || "http://app:8090";
}

export function clampBaseSeed(seed: number): number {
  if (Number.isNaN(seed)) return BASE_SEED.defaultValue;
  if (seed < BASE_SEED.min) return BASE_SEED.min;
  if (seed > BASE_SEED.max) return BASE_SEED.max;
  return seed;
}

/**
 * Default resolved seeds when API is not available (SSR or error).
 * Returns seed 1 for all versions as fallback.
 */
function getDefaultResolvedSeeds(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  return {
    base: safeSeed,
    v1: 1,
    v2: 1,
    v3: 1,
  };
}

/**
 * Get resolved seeds for seed = 1 (original/default seed).
 * Returns seed 1 for all versions (enabled or disabled) without calling the API.
 * If a version is disabled, it still receives seed 1.
 */
function getSeedOneResolvedSeeds(): ResolvedSeeds {
  return {
    base: 1,
    v1: 1,  // Always 1, even if V1 is disabled
    v2: 1,  // Always 1, even if V2 is disabled
    v3: 1,  // Always 1, even if V3 is disabled
  };
}

/**
 * Resolve seeds using centralized webs_server API.
 * Skips API call for seed = 1 and returns known values directly.
 * 
 * Enabled flags are determined from URL parameter ?enable_dynamic=v1,v2
 * or from environment variables if URL parameter is not present.
 */
export async function resolveSeeds(baseSeed: number): Promise<ResolvedSeeds> {
  const safeSeed = clampBaseSeed(baseSeed);
  const enabledFlags = getEnabledFlagsInternal();

  // During SSR, return default values (will be resolved on client-side)
  if (typeof window === "undefined") {
    // For seed = 1, return known values; otherwise return defaults
    if (safeSeed === 1) {
      return getSeedOneResolvedSeeds();
    }
    return getDefaultResolvedSeeds(safeSeed);
  }

  // Skip API call for seed = 1 - return known values directly
  if (safeSeed === 1) {
    console.log("[seed-resolver] Seed is 1, skipping API call and returning seed 1 for all versions");
    return getSeedOneResolvedSeeds();
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
    
    // If a version is disabled, always return seed 1
    // If a version is enabled, use the API response (or 1 as fallback)
    return {
      base: data.base ?? safeSeed,
      v1: enabledFlags.v1 ? (data.v1 ?? 1) : 1,  // If disabled: 1, if enabled: use API value or 1
      v2: enabledFlags.v2 ? (data.v2 ?? 1) : 1,  // If disabled: 1, if enabled: use API value or 1
      v3: enabledFlags.v3 ? (data.v3 ?? 1) : 1,  // If disabled: 1, if enabled: use API value or 1
    };
  } catch (error) {
    console.error("[seed-resolver] API call failed, returning seed 1 for all versions:", error);
    // Return seed 1 for all versions instead of null
    return getDefaultResolvedSeeds(safeSeed);
  }
}

/**
 * Synchronous version that returns default values.
 * For seed = 1, returns known values directly.
 * Seeds will be resolved asynchronously via resolveSeeds() for other seeds.
 * Use this only for initial state - actual resolution happens via resolveSeeds().
 */
export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  // For seed = 1, return known values; otherwise return defaults
  if (safeSeed === 1) {
    return getSeedOneResolvedSeeds();
  }
  return getDefaultResolvedSeeds(baseSeed);
}

/**
 * Get current enabled flags (from URL or env)
 * Public API for checking what's enabled
 */
export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean } {
  return getEnabledFlagsInternal();
}

export const seedResolverConfig = {
  base: BASE_SEED,
  getEnabledFlags,
};
