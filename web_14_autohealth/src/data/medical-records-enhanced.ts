import type { Doctor, MedicalRecord } from "@/data/types";
import fallbackMedicalRecordsJson from "@/data/original/medical-records_1.json";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

const CACHE_KEY = 'autohealth_medical_records_v1';
const PROJECT_KEY = 'web_14_autohealth';
let recordsCache: MedicalRecord[] = [];
const FALLBACK_MEDICAL_RECORDS: MedicalRecord[] = Array.isArray(fallbackMedicalRecordsJson) ? (fallbackMedicalRecordsJson as MedicalRecord[]) : [];

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
    throw new Error(`[autohealth] No medical records returned from dataset (seed=${effectiveSeed})`);
  }
  return records;
}

export async function initializeMedicalRecords(doctors?: Doctor[], v2SeedValue?: number | null): Promise<MedicalRecord[]> {
  const dbModeEnabled = isDbLoadModeEnabled();

  // Check base seed from URL - if seed = 1, use original data
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autohealth] Base seed is 1, using original medical records data (skipping DB mode)");
    recordsCache = FALLBACK_MEDICAL_RECORDS;
    return recordsCache;
  }

  if (dbModeEnabled) {
    if (recordsCache.length > 0) return recordsCache;
    recordsCache = await loadMedicalRecordsFromDataset(v2SeedValue);
    return recordsCache;
  }

  recordsCache = FALLBACK_MEDICAL_RECORDS;
  return recordsCache;
}
