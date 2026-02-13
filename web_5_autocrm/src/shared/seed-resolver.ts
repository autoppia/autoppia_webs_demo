/**
 * Simplified seed utilities for autocrm.
 * All variants mirror the base seed from the URL.
 */

const BOOL_TRUE = ["true", "1", "yes", "y"];

export interface ResolvedSeeds {
  base: number;
  v1: number;
  v2: number;
  v3: number;
}

const boolFromEnv = (value?: string | undefined | null): boolean => {
  if (!value) return false;
  return BOOL_TRUE.includes(value.toLowerCase());
};

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

function getEnabledFlagsInternal(): { v1: boolean; v2: boolean; v3: boolean } {
  const urlFlags = parseEnableDynamicFromUrl();
  if (urlFlags) return urlFlags;

  return {
    v1:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 || process.env.ENABLE_DYNAMIC_V1 || "")
        .toLowerCase() === "true",
    v2:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 || process.env.ENABLE_DYNAMIC_V2 || "")
        .toLowerCase() === "true",
    v3:
      (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 || process.env.ENABLE_DYNAMIC_V3 || "")
        .toLowerCase() === "true",
  };
}

const clampSeedValue = (seed: number): number => Math.min(999, Math.max(1, Math.round(seed) || 1));

const resolvedCache = new Map<number, ResolvedSeeds>();

const buildSeeds = (seed: number): ResolvedSeeds => {
  const safeSeed = clampSeedValue(seed);
  return {
    base: safeSeed,
    v1: safeSeed,
    v2: safeSeed,
    v3: safeSeed,
  };
};

export async function resolveSeeds(baseSeed: number): Promise<ResolvedSeeds> {
  const safeSeed = clampSeedValue(baseSeed);
  if (resolvedCache.has(safeSeed)) return resolvedCache.get(safeSeed)!;

  const resolved = buildSeeds(safeSeed);
  resolvedCache.set(safeSeed, resolved);
  return resolved;
}

export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampSeedValue(baseSeed);
  return resolvedCache.get(safeSeed) ?? buildSeeds(safeSeed);
}

export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean } {
  return getEnabledFlagsInternal();
}
