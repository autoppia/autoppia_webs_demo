import type { Doctor, MedicalRecord } from "@/data/types";
import fallbackMedicalRecordsJson from "@/data/original/medical-records_1.json";
import { isDataGenerationAvailable, generateMedicalRecords } from "@/utils/healthDataGenerator";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";
import { clampBaseSeed } from "@/shared/seed-resolver";

const CACHE_KEY = 'autohealth_medical_records_v1';
const DOCTORS_CACHE_KEY = 'autohealth_doctors_v1';
const PROJECT_KEY = 'web_14_autohealth';
let recordsCache: MedicalRecord[] = [];
const FALLBACK_MEDICAL_RECORDS: MedicalRecord[] = Array.isArray(fallbackMedicalRecordsJson) ? (fallbackMedicalRecordsJson as MedicalRecord[]) : [];

/**
 * Get base seed from URL parameter
 */
const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) {
      return clampBaseSeed(parsed);
    }
  }
  return null;
};

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
  const aiGenerateEnabled = isDataGenerationAvailable();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autohealth] Base seed is 1, using original medical records data (skipping DB/AI modes)");
    recordsCache = FALLBACK_MEDICAL_RECORDS;
    return recordsCache;
  }
  
  if (dbModeEnabled) {
    if (recordsCache.length > 0) return recordsCache;
    recordsCache = await loadMedicalRecordsFromDataset(v2SeedValue);
    return recordsCache;
  }

  if (!aiGenerateEnabled) {
    recordsCache = FALLBACK_MEDICAL_RECORDS;
    return recordsCache;
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        recordsCache = JSON.parse(raw) as MedicalRecord[];
        if (recordsCache.length > 0) return recordsCache;
      } catch {}
    }
  }
  
  let doctorsToUse = doctors;
  if (!doctorsToUse && typeof window !== 'undefined') {
    const doctorsRaw = localStorage.getItem(DOCTORS_CACHE_KEY);
    if (doctorsRaw) {
      try { doctorsToUse = JSON.parse(doctorsRaw) as Doctor[]; } catch {}
    }
  }
  
  const result = await generateMedicalRecords(
    24,
    doctorsToUse?.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })) || []
  );
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    recordsCache = result.data as MedicalRecord[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(recordsCache));
    return recordsCache;
  }
  recordsCache = FALLBACK_MEDICAL_RECORDS;
  return recordsCache;
}
