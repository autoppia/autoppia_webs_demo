import type { Doctor } from "@/data/types";
import fallbackDoctorsJson from "@/data/original/doctors_1.json";
import { isDataGenerationAvailable, generateDoctors } from "@/utils/healthDataGenerator";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";
import { clampBaseSeed } from "@/shared/seed-resolver";

const CACHE_KEY = 'autohealth_doctors_v2';
const PROJECT_KEY = 'web_14_autohealth';
let doctorsCache: Doctor[] = [];
let lastSeed: number | null = null;
const FALLBACK_DOCTORS: Doctor[] = Array.isArray(fallbackDoctorsJson) ? (fallbackDoctorsJson as Doctor[]) : [];

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
  const aiGenerateEnabled = isDataGenerationAvailable();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autohealth] Base seed is 1, using original data (skipping DB/AI modes)");
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

  if (!aiGenerateEnabled) {
    doctorsCache = FALLBACK_DOCTORS;
    return doctorsCache;
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        doctorsCache = JSON.parse(raw) as Doctor[];
        if (doctorsCache.length > 0) return doctorsCache;
      } catch { }
    }
  }

  const result = await generateDoctors(12);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    doctorsCache = result.data as Doctor[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(doctorsCache));
    return doctorsCache;
  }

  doctorsCache = FALLBACK_DOCTORS;
  return doctorsCache;
}
