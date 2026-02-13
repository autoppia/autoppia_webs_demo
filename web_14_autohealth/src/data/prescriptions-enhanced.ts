import type { Doctor, Prescription } from "@/data/types";
import fallbackPrescriptionsJson from "@/data/original/prescriptions_1.json";
import { isDataGenerationAvailable, generatePrescriptions } from "@/utils/healthDataGenerator";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

const CACHE_KEY = 'autohealth_prescriptions_v1';
const DOCTORS_CACHE_KEY = 'autohealth_doctors_v1';
const PROJECT_KEY = 'web_14_autohealth';
let prescriptionsCache: Prescription[] = [];
const FALLBACK_PRESCRIPTIONS: Prescription[] = Array.isArray(fallbackPrescriptionsJson) ? (fallbackPrescriptionsJson as Prescription[]) : [];

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
    throw new Error(`[autohealth] No prescriptions returned from dataset (seed=${effectiveSeed})`);
  }
  return prescriptions;
}

export async function initializePrescriptions(doctors?: Doctor[], v2SeedValue?: number | null): Promise<Prescription[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isDataGenerationAvailable();

  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autohealth] Base seed is 1, using original prescriptions data (skipping DB/AI modes)");
    prescriptionsCache = FALLBACK_PRESCRIPTIONS;
    return prescriptionsCache;
  }

  if (dbModeEnabled) {
    if (prescriptionsCache.length > 0) return prescriptionsCache;
    prescriptionsCache = await loadPrescriptionsFromDataset(v2SeedValue);
    return prescriptionsCache;
  }

  if (!aiGenerateEnabled) {
    prescriptionsCache = FALLBACK_PRESCRIPTIONS;
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
  prescriptionsCache = FALLBACK_PRESCRIPTIONS;
  return prescriptionsCache;
}
