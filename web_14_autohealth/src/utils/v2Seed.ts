import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { getBaseSeedFromUrl } from "@/shared/seed-resolver";

const clampSeed = (value: number, fallback = 1): number => {
  if (!Number.isFinite(value)) return fallback;
  if (value < 1) return 1;
  if (value > 300) return 300;
  return value;
};

export const shouldUseDbSeed = () => isDbLoadModeEnabled();

export const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autohealthV2Seed;
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampSeed(value);
  }
  return null;
};

export const resolveDatasetSeed = (seedValue?: number | null): number => {
  if (!isDbLoadModeEnabled()) return 1;

  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampSeed(seedValue);
  }

  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    // If base seed is 1, v2 should also be 1
    if (baseSeed === 1) {
      return 1;
    }

    // For other seeds, use base seed directly (v2 seed = base seed)
    return clampSeed(baseSeed);
  }

  const runtime = getRuntimeV2Seed();
  if (runtime !== null) {
    return runtime;
  }
  return 1;
};

export const waitForDatasetSeed = async (seedValue?: number | null) => {
  if (!isDbLoadModeEnabled()) return;
  if (typeof window === "undefined") return;
  if (typeof seedValue === "number") return;
  await new Promise((resolve) => setTimeout(resolve, 75));
};
