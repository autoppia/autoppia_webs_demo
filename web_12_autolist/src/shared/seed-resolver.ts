/**
 * Seed para autolist: clamp y flags.
 * La seed de la URL se usa tal cual para /datasets/load. No hay "resolución".
 */

const BOOL_TRUE = ["true", "1", "yes", "y"];

function boolFromEnv(value?: string | undefined | null): boolean {
  if (!value) return false;
  return BOOL_TRUE.includes(value.toLowerCase());
}

function parseEnableDynamicFromUrl(): { v1: boolean; v2: boolean; v3: boolean } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const enableDynamic = params.get("enable_dynamic");
  if (!enableDynamic) return null;
  const parts = enableDynamic.toLowerCase().split(",").map(s => s.trim());
  return {
    v1: false,
    v2: parts.includes("v2"),
    v3: parts.includes("v3"),
  };
}

function getEnabledFlagsInternal(): { v1: boolean; v2: boolean; v3: boolean } {
  const urlFlags = parseEnableDynamicFromUrl();
  if (urlFlags) return urlFlags;
  return {
    v1: false,
    v2: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2) ||
        boolFromEnv(process.env.ENABLE_DYNAMIC_V2),
    v3: boolFromEnv(process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3) ||
        boolFromEnv(process.env.ENABLE_DYNAMIC_V3),
  };
}

const BASE_SEED = { min: 1, max: 999, defaultValue: 1 };

export function clampBaseSeed(seed: number): number {
  if (Number.isNaN(seed)) return BASE_SEED.defaultValue;
  if (seed < BASE_SEED.min) return BASE_SEED.min;
  if (seed > BASE_SEED.max) return BASE_SEED.max;
  return seed;
}

/** Seed para /datasets/load: si v2 activo → seed (clamped), si no → 1 */
export function getSeedForLoad(seed: number): number {
  return getEnabledFlagsInternal().v2 ? clampBaseSeed(seed) : 1;
}

export function getEnabledFlags(): { v1: boolean; v2: boolean; v3: boolean } {
  return getEnabledFlagsInternal();
}

export const seedResolverConfig = {
  base: BASE_SEED,
  getEnabledFlags,
};
