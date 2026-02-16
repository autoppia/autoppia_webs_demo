import type { Doctor } from "@/data/types";
import fallbackDoctorsJson from "@/data/original/doctors_1.json";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

const CACHE_KEY = 'autohealth_doctors_v2';
const PROJECT_KEY = 'web_14_autohealth';
let doctorsCache: Doctor[] = [];
let lastSeed: number | null = null;
const FALLBACK_DOCTORS: Doctor[] = Array.isArray(fallbackDoctorsJson) ? (fallbackDoctorsJson as Doctor[]) : [];

async function loadDoctorsFromDataset(v2SeedValue?: number | null): Promise<Doctor[]> {
  await waitForDatasetSeed(v2SeedValue);
  const effectiveSeed = resolveDatasetSeed(v2SeedValue);
  const doctors = await fetchSeededSelection<Doctor>({
    projectKey: PROJECT_KEY,
    entityType: "doctors",
    seedValue: effectiveSeed,
    limit: 50,
    method: "distribute",
    filterKey: "specialty",
  });
  if (!Array.isArray(doctors) || doctors.length === 0) {
    throw new Error(`[autohealth] No doctors returned from dataset (seed=${effectiveSeed})`);
  }
  return doctors;
}

export async function initializeDoctors(v2SeedValue?: number | null): Promise<Doctor[]> {
  const dbModeEnabled = isDbLoadModeEnabled();

  // Check base seed from URL - if seed = 1, use original data
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autohealth] Base seed is 1, using original data (skipping DB mode)");
    doctorsCache = FALLBACK_DOCTORS;
    lastSeed = 1;
    return doctorsCache;
  }

  // Clear cache if seed changed
  const currentSeed = v2SeedValue ?? null;
  if (lastSeed !== null && currentSeed !== null && lastSeed !== currentSeed) {
    doctorsCache = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  }
  lastSeed = currentSeed;

  if (dbModeEnabled) {
    if (doctorsCache.length > 0 && lastSeed === currentSeed) return doctorsCache;
    doctorsCache = await loadDoctorsFromDataset(v2SeedValue);
    return doctorsCache;
  }

  doctorsCache = FALLBACK_DOCTORS;
  return doctorsCache;
}
