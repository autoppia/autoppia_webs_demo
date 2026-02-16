import { getBaseSeedFromUrl, clampBaseSeed } from "@/shared/seed-resolver";


export const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autohealthV2Seed;
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampBaseSeed(value);
  }
  return null;
};

export const resolveDatasetSeed = (seedValue?: number | null): number => {
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampBaseSeed(seedValue);
  }

  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    return clampBaseSeed(baseSeed);
  }

  const runtime = getRuntimeV2Seed();
  if (runtime !== null) {
    return runtime;
  }
  return 1;
};

export const waitForDatasetSeed = async (seedValue?: number | null) => {
  if (typeof window === "undefined") return;
  if (typeof seedValue === "number") return;
  await new Promise((resolve) => setTimeout(resolve, 75));
};
