import type { Doctor, Prescription } from "@/data/types";
import fallbackPrescriptionsJson from "@/data/original/prescriptions_1.json";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

const CACHE_KEY = 'autohealth_prescriptions_v1';
const PROJECT_KEY = 'web_14_autohealth';
let prescriptionsCache: Prescription[] = [];
const FALLBACK_PRESCRIPTIONS: Prescription[] = Array.isArray(fallbackPrescriptionsJson) ? (fallbackPrescriptionsJson as Prescription[]) : [];

async function loadPrescriptionsFromDataset(v2SeedValue?: number | null): Promise<Prescription[]> {
  await waitForDatasetSeed(v2SeedValue);
  const effectiveSeed = resolveDatasetSeed(v2SeedValue);
  const prescriptions = await fetchSeededSelection<Prescription>({
    projectKey: PROJECT_KEY,
    entityType: "prescriptions",
    seedValue: effectiveSeed,
    limit: 50,
    method: "distribute",
    filterKey: "category",
  });
  if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
    throw new Error(`[autohealth] No prescriptions returned from dataset (seed=${effectiveSeed})`);
  }
  return prescriptions;
}

export async function initializePrescriptions(doctors?: Doctor[], v2SeedValue?: number | null): Promise<Prescription[]> {
  const dbModeEnabled = isDbLoadModeEnabled();

  // Check base seed from URL - if seed = 1, use original data
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autohealth] Base seed is 1, using original prescriptions data (skipping DB mode)");
    prescriptionsCache = FALLBACK_PRESCRIPTIONS;
    return prescriptionsCache;
  }

  if (dbModeEnabled) {
    if (prescriptionsCache.length > 0) return prescriptionsCache;
    prescriptionsCache = await loadPrescriptionsFromDataset(v2SeedValue);
    return prescriptionsCache;
  }

  prescriptionsCache = FALLBACK_PRESCRIPTIONS;
  return prescriptionsCache;
}
