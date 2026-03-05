const SEED_RANGE = { min: 1, max: 999, defaultValue: 1 };

export function clampSeed(seed: number): number {
  if (Number.isNaN(seed)) return SEED_RANGE.defaultValue;
  if (seed < SEED_RANGE.min) return SEED_RANGE.min;
  if (seed > SEED_RANGE.max) return SEED_RANGE.max;
  return seed;
}

export function getSeedFromUrl(search: string): number {
  if (!search) return SEED_RANGE.defaultValue;
  try {
    const params = new URLSearchParams(
      search.startsWith("?") ? search : `?${search}`,
    );
    const raw = params.get("seed");
    if (raw) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed)) return SEED_RANGE.defaultValue;
      return clampSeed(parsed);
    }

    // Backward-compat: tolerate malformed URLs like channel=c1/?seed=43
    for (const value of params.values()) {
      const match = value.match(/[?&]seed=(\d+)/);
      if (!match) continue;
      const parsed = Number.parseInt(match[1], 10);
      if (!Number.isFinite(parsed)) continue;
      return clampSeed(parsed);
    }

    return SEED_RANGE.defaultValue;
  } catch {
    return SEED_RANGE.defaultValue;
  }
}
