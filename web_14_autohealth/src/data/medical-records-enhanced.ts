import type { MedicalRecord } from '@/data/medical-records';
import type { Doctor } from '@/data/doctors';
import { isDataGenerationAvailable, generateMedicalRecords } from '@/utils/healthDataGenerator';
import { fetchSeededSelection, isDbLoadModeEnabled } from '@/shared/seeded-loader';
import { resolveDatasetSeed, waitForDatasetSeed } from '@/utils/v2Seed';

const CACHE_KEY = 'autohealth_medical_records_v1';
const DOCTORS_CACHE_KEY = 'autohealth_doctors_v1';
const PROJECT_KEY = 'web_14_autohealth';
let recordsCache: MedicalRecord[] = [];

async function loadMedicalRecordsFromDataset(v2SeedValue?: number | null): Promise<MedicalRecord[]> {
  await waitForDatasetSeed(v2SeedValue);
  const effectiveSeed = resolveDatasetSeed(v2SeedValue);
  const records = await fetchSeededSelection<MedicalRecord>({
    projectKey: PROJECT_KEY,
    entityType: "medical-records",
    seedValue: effectiveSeed,
    limit: 60,
    method: "distribute",
    filterKey: "type",
  });
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`[autohealth] No medical records returned from dataset (seed=${effectiveSeed})`);
  }
  return records;
}

export async function initializeMedicalRecords(doctors?: Doctor[], v2SeedValue?: number | null): Promise<MedicalRecord[]> {
  if (isDbLoadModeEnabled()) {
    if (recordsCache.length > 0) return recordsCache;
    recordsCache = await loadMedicalRecordsFromDataset(v2SeedValue);
    return recordsCache;
  }

  if (!isDataGenerationAvailable()) {
    recordsCache = (await import('./medical-records')).medicalRecords as MedicalRecord[];
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
  recordsCache = (await import('./medical-records')).medicalRecords as MedicalRecord[];
  return recordsCache;
}
