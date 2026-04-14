/**
 * Seed utilities: single base seed from URL for v1/v2/v3.
 */

const SEED_RANGE = { min: 1, max: 999, defaultValue: 1 };

export function clampSeed(seed: number): number {
  if (Number.isNaN(seed)) return SEED_RANGE.defaultValue;
  if (seed < SEED_RANGE.min) return SEED_RANGE.min;
  if (seed > SEED_RANGE.max) return SEED_RANGE.max;
  return seed;
}

export function getSeedFromUrl(): number {
  if (typeof window === "undefined") return SEED_RANGE.defaultValue;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("seed");
    if (!raw) return SEED_RANGE.defaultValue;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return SEED_RANGE.defaultValue;
    return clampSeed(parsed);
  } catch {
    // ignore
  }
  return SEED_RANGE.defaultValue;
}
