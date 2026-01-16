/**
 * Shared seed resolver utilities.
 * Takes a single base seed and derives seeds for each dynamic layer (v1/v2/v3)
 * so we only keep ?seed=XYZ in the URL.
 *
 * Mirrors the logic from webs_server so the mapping stays deterministic.
 */

const BOOL_TRUE = ["true", "1", "yes", "y"];

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
  const fromUrl = parseEnableDynamicFromUrl();
  if (fromUrl) return fromUrl;
  return {
    v1: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1) || boolFromEnv(process.env.ENABLE_DYNAMIC_V1),
    v2: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE) || boolFromEnv(process.env.ENABLE_DYNAMIC_V2_DB_MODE),
    v3: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) || boolFromEnv(process.env.ENABLE_DYNAMIC_V3),
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

export function clampBaseSeed(seed: number): number {
  if (Number.isNaN(seed)) return BASE_SEED.defaultValue;
  if (seed < BASE_SEED.min) return BASE_SEED.min;
  if (seed > BASE_SEED.max) return BASE_SEED.max;
  return seed;
}

function resolveSeedsLocal(baseSeed: number, enabledFlags?: { v1: boolean; v2: boolean; v3: boolean }): ResolvedSeeds {
  const safeSeed = clampBaseSeed(baseSeed);
  const flags = enabledFlags || getEnabledFlagsInternal();
  const resolved: ResolvedSeeds = {
    base: safeSeed,
    v1: null,
    v2: null,
    v3: null,
  };
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

export function resolveSeedsSync(baseSeed: number): ResolvedSeeds {
  return resolveSeedsLocal(baseSeed, getEnabledFlagsInternal());
}
