/**
 * Simplified seed utilities for automail.
 * All variants mirror the base seed from the URL.
 */

export type ResolvedSeeds = {
  base: number;
  v1: number;
  v2: number;
  v3: number;
};

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

export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  return resolvedCache.get(safeSeed) ?? buildSeeds(safeSeed);
}
