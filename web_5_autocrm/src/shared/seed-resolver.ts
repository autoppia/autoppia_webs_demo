/**
 * Simplified seed utilities for autocrm.
 * All variants mirror the base seed from the URL.
 */


export interface ResolvedSeeds {
  base: number;
  v1: number;
  v2: number;
  v3: number;
}

const BASE_SEED = {
  min: 1,
  max: 999,
  defaultValue: 1,
};

export function clampBaseSeed(seed: number): number {
  if (Number.isNaN(seed)) return BASE_SEED.defaultValue;
  if (seed < BASE_SEED.min) return BASE_SEED.min;
  if (seed > BASE_SEED.max) return BASE_SEED.max;
  return seed;
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

const resolvedCache = new Map<number, ResolvedSeeds>();

const buildSeeds = (seed: number): ResolvedSeeds => {
  const safeSeed = clampBaseSeed(seed);
  return {
    base: safeSeed,
    v1: safeSeed,
    v2: safeSeed,
    v3: safeSeed,
  };
};

export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  return resolvedCache.get(safeSeed) ?? buildSeeds(safeSeed);
}

export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean } {
  return getEnabledFlagsInternal();
}
