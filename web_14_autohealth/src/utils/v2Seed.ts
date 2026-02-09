import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync } from "@/shared/seed-resolver";

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
    const resolved = resolveSeedsSync(seedValue);
    if (resolved.v2 !== null) {
      return clampSeed(resolved.v2);
    }
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
