/**
 * Seed Resolution System for web_5_autocrm
 * Always uses backend /seeds/resolve; no local formulas.
 */

export interface ResolvedSeeds {
  base: number;
  v1: number | null;
  v2: number | null;
  v3: number | null;
}

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

function getEnabledFlagsFromEnv(): { v1: boolean; v2: boolean; v3: boolean } {
  if (typeof window === "undefined") {
    return {
      v1: (process.env.ENABLE_DYNAMIC_V1 || "").toLowerCase() === "true",
      v2: (process.env.ENABLE_DYNAMIC_V2 || "").toLowerCase() === "true",
      v3: (process.env.ENABLE_DYNAMIC_V3 || "").toLowerCase() === "true",
    };
  }

  return {
    v1:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 || process.env.ENABLE_DYNAMIC_V1 || "")
        .toLowerCase() === "true",
    v2:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 ||
        process.env.ENABLE_DYNAMIC_V2 ||
        "")
        .toLowerCase() === "true",
    v3:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 || process.env.ENABLE_DYNAMIC_V3 || "")
        .toLowerCase() === "true",
  };
}

function getEnabledFlagsInternal(): { v1: boolean; v2: boolean; v3: boolean } {
  const urlFlags = parseEnableDynamicFromUrl();
  if (urlFlags !== null) {
    return urlFlags;
  }
  return getEnabledFlagsFromEnv();
}

export function clampBaseSeed(seed: number, minVal: number = 1, maxVal: number = 999): number {
  if (seed < minVal) return minVal;
  if (seed > maxVal) return maxVal;
  return seed;
}

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

const resolvedCache = new Map<number, ResolvedSeeds>();
const inflight = new Map<number, Promise<ResolvedSeeds>>();

function getFallbackResolved(seed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(seed);
  return { base: safeSeed, v1: null, v2: null, v3: null };
}

function shouldSkipSeedResolution(
  seed: number,
  flags: { v1: boolean; v2: boolean; v3: boolean }
): { skip: boolean; reason?: string } {
  if (seed === 1) {
    return { skip: true, reason: "base seed is 1 (use defaults)" };
  }

  const disabled = Object.entries(flags)
    .filter(([, enabled]) => !enabled)
    .map(([version]) => version.toUpperCase());

  if (disabled.length > 0) {
    return { skip: true, reason: `disabled versions: ${disabled.join(", ")}` };
  }

  return { skip: false };
}

function buildResolveUrl(seed: number, flags: { v1: boolean; v2: boolean; v3: boolean }): string {
  const apiUrl = getApiBaseUrl();
  const url = new URL(`${apiUrl}/seeds/resolve`);
  url.searchParams.set("seed", seed.toString());
  url.searchParams.set("v1_enabled", String(flags.v1));
  url.searchParams.set("v2_enabled", String(flags.v2));
  url.searchParams.set("v3_enabled", String(flags.v3));
  return url.toString();
}

export async function resolveSeeds(baseSeed: number): Promise<ResolvedSeeds> {
  const safeSeed = clampBaseSeed(baseSeed);
  if (resolvedCache.has(safeSeed)) return resolvedCache.get(safeSeed)!;
  if (inflight.has(safeSeed)) return inflight.get(safeSeed)!;

  const flags = getEnabledFlagsInternal();
  const skip = shouldSkipSeedResolution(safeSeed, flags);
  if (skip.skip) {
    const fallback = getFallbackResolved(safeSeed);
    resolvedCache.set(safeSeed, fallback);
    if (skip.reason) {
      console.log(`[seed-resolver] Skipping API call: ${skip.reason}`);
    }
    return fallback;
  }

  const promise = (async () => {
    try {
      const response = await fetch(buildResolveUrl(safeSeed, flags), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Seed resolution API failed: ${response.status}`);
      }
      const data = await response.json();
      const resolved: ResolvedSeeds = {
        base: data.base ?? safeSeed,
        v1: data.v1 ?? null,
        v2: data.v2 ?? null,
        v3: data.v3 ?? null,
      };
      resolvedCache.set(safeSeed, resolved);
      return resolved;
    } catch (error) {
      console.warn("[seed-resolver] API call failed, using fallback seeds:", error);
      const fallback = getFallbackResolved(safeSeed);
      resolvedCache.set(safeSeed, fallback);
      return fallback;
    } finally {
      inflight.delete(safeSeed);
    }
  })();

  inflight.set(safeSeed, promise);
  return promise;
}

export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  return resolvedCache.get(safeSeed) ?? getFallbackResolved(safeSeed);
}

export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean } {
  return getEnabledFlagsInternal();
}
