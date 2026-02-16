import type { Doctor } from "@/data/types";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";

const CACHE_KEY = 'autohealth_doctors_v2';
const PROJECT_KEY = 'web_14_autohealth';
let doctorsCache: Doctor[] = [];
let lastSeed: number | null = null;

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
    throw new Error(`[autohealth] No doctors returned from server (seed=${effectiveSeed})`);
  }
  return doctors;
}

export async function initializeDoctors(v2SeedValue?: number | null): Promise<Doctor[]> {
  // Clear cache if seed changed
  const currentSeed = v2SeedValue ?? null;
  if (lastSeed !== null && currentSeed !== null && lastSeed !== currentSeed) {
    doctorsCache = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  }
  lastSeed = currentSeed;

  // Always call the server endpoint - server is the single source of truth
  if (doctorsCache.length > 0 && lastSeed === currentSeed) return doctorsCache;

  try {
    doctorsCache = await loadDoctorsFromDataset(v2SeedValue);
    return doctorsCache;
  } catch (error) {
    console.error("[autohealth] Failed to load doctors from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
