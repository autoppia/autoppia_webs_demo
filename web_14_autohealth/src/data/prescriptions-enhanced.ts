import type { Doctor, Prescription } from "@/data/types";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";

const CACHE_KEY = 'autohealth_prescriptions_v1';
const PROJECT_KEY = 'web_14_autohealth';
let prescriptionsCache: Prescription[] = [];

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
    throw new Error(`[autohealth] No prescriptions returned from server (seed=${effectiveSeed})`);
  }
  return prescriptions;
}

export async function initializePrescriptions(doctors?: Doctor[], v2SeedValue?: number | null): Promise<Prescription[]> {
  // Always call the server endpoint - server is the single source of truth
  if (prescriptionsCache.length > 0) return prescriptionsCache;

  try {
    prescriptionsCache = await loadPrescriptionsFromDataset(v2SeedValue);
    return prescriptionsCache;
  } catch (error) {
    console.error("[autohealth] Failed to load prescriptions from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
