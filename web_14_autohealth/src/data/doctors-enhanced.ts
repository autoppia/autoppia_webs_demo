import type { Doctor } from '@/data/doctors';
import { isDataGenerationAvailable, generateDoctors } from '@/utils/healthDataGenerator';
import { fetchSeededSelection, isDbLoadModeEnabled } from '@/shared/seeded-loader';
import { resolveDatasetSeed, waitForDatasetSeed } from '@/utils/v2Seed';

const CACHE_KEY = 'autohealth_doctors_v1';
const PROJECT_KEY = 'web_14_autohealth';
let doctorsCache: Doctor[] = [];

async function loadDoctorsFromDataset(v2SeedValue?: number | null): Promise<Doctor[]> {
  await waitForDatasetSeed(v2SeedValue);
  const effectiveSeed = resolveDatasetSeed(v2SeedValue);
  const doctors = await fetchSeededSelection<Doctor>({
    projectKey: PROJECT_KEY,
    entityType: "doctors",
    seedValue: effectiveSeed,
    limit: 40,
    method: "distribute",
    filterKey: "specialty",
  });
  if (!Array.isArray(doctors) || doctors.length === 0) {
    throw new Error(`[autohealth] No doctors returned from dataset (seed=${effectiveSeed})`);
  }
  return doctors;
}

export async function initializeDoctors(v2SeedValue?: number | null): Promise<Doctor[]> {
  if (isDbLoadModeEnabled()) {
    if (doctorsCache.length > 0) return doctorsCache;
    doctorsCache = await loadDoctorsFromDataset(v2SeedValue);
    return doctorsCache;
  }

  if (!isDataGenerationAvailable()) {
    doctorsCache = (await import('./doctors')).doctors as Doctor[];
    return doctorsCache;
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        doctorsCache = JSON.parse(raw) as Doctor[];
        if (doctorsCache.length > 0) return doctorsCache;
      } catch {}
    }
  }

  const result = await generateDoctors(12);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    doctorsCache = result.data as Doctor[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(doctorsCache));
    return doctorsCache;
  }

  doctorsCache = (await import('./doctors')).doctors as Doctor[];
  return doctorsCache;
}
