import type { Prescription } from '@/data/prescriptions';
import type { Doctor } from '@/data/doctors';
import { isDataGenerationAvailable, generatePrescriptions } from '@/utils/healthDataGenerator';
import { fetchSeededSelection, isDbLoadModeEnabled } from '@/shared/seeded-loader';
import { resolveDatasetSeed, waitForDatasetSeed } from '@/utils/v2Seed';

const CACHE_KEY = 'autohealth_prescriptions_v1';
const DOCTORS_CACHE_KEY = 'autohealth_doctors_v1';
const PROJECT_KEY = 'web_14_autohealth';
let prescriptionsCache: Prescription[] = [];

async function loadPrescriptionsFromDataset(v2SeedValue?: number | null): Promise<Prescription[]> {
  await waitForDatasetSeed(v2SeedValue);
  const effectiveSeed = resolveDatasetSeed(v2SeedValue);
  const prescriptions = await fetchSeededSelection<Prescription>({
    projectKey: PROJECT_KEY,
    entityType: "prescriptions",
    seedValue: effectiveSeed,
    limit: 60,
    method: "distribute",
    filterKey: "category",
  });
  if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
    throw new Error(`[autohealth] No prescriptions returned from dataset (seed=${effectiveSeed})`);
  }
  return prescriptions;
}

export async function initializePrescriptions(doctors?: Doctor[], v2SeedValue?: number | null): Promise<Prescription[]> {
  if (isDbLoadModeEnabled()) {
    if (prescriptionsCache.length > 0) return prescriptionsCache;
    prescriptionsCache = await loadPrescriptionsFromDataset(v2SeedValue);
    return prescriptionsCache;
  }

  if (!isDataGenerationAvailable()) {
    prescriptionsCache = (await import('./prescriptions')).prescriptions as Prescription[];
    return prescriptionsCache;
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        prescriptionsCache = JSON.parse(raw) as Prescription[];
        if (prescriptionsCache.length > 0) return prescriptionsCache;
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
  
  const result = await generatePrescriptions(
    30,
    doctorsToUse?.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })) || []
  );
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    prescriptionsCache = result.data as Prescription[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(prescriptionsCache));
    return prescriptionsCache;
  }
  prescriptionsCache = (await import('./prescriptions')).prescriptions as Prescription[];
  return prescriptionsCache;
}
