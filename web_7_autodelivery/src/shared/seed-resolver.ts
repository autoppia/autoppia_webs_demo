/**
 * Simplified seed utilities for autodelivery.
 * All variants mirror the base seed from the URL.
 */

const BOOL_TRUE = ["true", "1", "yes", "y"];

export type ResolvedSeeds = {
  base: number;
  v1: number;
  v2: number;
  v3: number;
};

const boolFromEnv = (value?: string | undefined | null): boolean => {
  if (!value) return false;
  return BOOL_TRUE.includes(value.toLowerCase());
};

function parseEnableDynamicFromUrl(): { v1: boolean; v2: boolean; v3: boolean } | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const enableDynamic = params.get("enable_dynamic");
  if (!enableDynamic) return null;

  const parts = enableDynamic.toLowerCase().split(",").map((s) => s.trim());
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
    v1: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1) || boolFromEnv(process.env.ENABLE_DYNAMIC_V1),
    v2: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2) || boolFromEnv(process.env.ENABLE_DYNAMIC_V2),
    v3: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) || boolFromEnv(process.env.ENABLE_DYNAMIC_V3),
  };
}

const BASE_SEED = { min: 1, max: 999, defaultValue: 1 };

export function clampBaseSeed(seed: number): number {
  if (Number.isNaN(seed)) return BASE_SEED.defaultValue;
  if (seed < BASE_SEED.min) return BASE_SEED.min;
  if (seed > BASE_SEED.max) return BASE_SEED.max;
  return seed;
}

const resolvedCache = new Map<number, ResolvedSeeds>();

const buildSeeds = (seed: number): ResolvedSeeds => {
  const safeSeed = clampBaseSeed(seed);
  return { base: safeSeed, v1: safeSeed, v2: safeSeed, v3: safeSeed };
};

export async function resolveSeeds(baseSeed: number): Promise<ResolvedSeeds> {
  const safeSeed = clampBaseSeed(baseSeed);
  if (resolvedCache.has(safeSeed)) return resolvedCache.get(safeSeed)!;
  const resolved = buildSeeds(safeSeed);
  resolvedCache.set(safeSeed, resolved);
  return resolved;
}

export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  return resolvedCache.get(safeSeed) ?? buildSeeds(safeSeed);
}

export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean } {
  return getEnabledFlagsInternal();
}
