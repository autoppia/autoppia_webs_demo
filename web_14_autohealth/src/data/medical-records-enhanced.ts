import type { Doctor, MedicalRecord } from "@/data/types";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";

const CACHE_KEY = 'autohealth_medical_records_v1';
const PROJECT_KEY = 'web_14_autohealth';
let recordsCache: MedicalRecord[] = [];

async function loadMedicalRecordsFromDataset(v2SeedValue?: number | null): Promise<MedicalRecord[]> {
  await waitForDatasetSeed(v2SeedValue);
  const effectiveSeed = resolveDatasetSeed(v2SeedValue);
  const records = await fetchSeededSelection<MedicalRecord>({
    projectKey: PROJECT_KEY,
    entityType: "medical-records",
    seedValue: effectiveSeed,
    limit: 50,
    method: "distribute",
    filterKey: "type",
  });
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`[autohealth] No medical records returned from server (seed=${effectiveSeed})`);
  }
  return records;
}

export async function initializeMedicalRecords(doctors?: Doctor[], v2SeedValue?: number | null): Promise<MedicalRecord[]> {
  // Always call the server endpoint - server is the single source of truth
  if (recordsCache.length > 0) return recordsCache;

  try {
    recordsCache = await loadMedicalRecordsFromDataset(v2SeedValue);
    return recordsCache;
  } catch (error) {
    console.error("[autohealth] Failed to load medical records from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
