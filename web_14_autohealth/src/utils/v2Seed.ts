import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

export const resolveDatasetSeed = (seedValue?: number | null): number => {
  return isV2Enabled()
    ? clampSeed(seedValue ?? getSeedFromUrl())
    : 1;
};

export const waitForDatasetSeed = async (_seedValue?: number | null): Promise<void> => {
  return Promise.resolve();
};
