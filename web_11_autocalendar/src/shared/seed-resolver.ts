/**
 * Seed utilities: single base seed from URL for v1/v2/v3.
 */

const BASE_SEED = { min: 1, max: 999, defaultValue: 1 };

export function clampBaseSeed(seed: number): number {
  if (Number.isNaN(seed)) return BASE_SEED.defaultValue;
  if (seed < BASE_SEED.min) return BASE_SEED.min;
  if (seed > BASE_SEED.max) return BASE_SEED.max;
  return seed;
}
