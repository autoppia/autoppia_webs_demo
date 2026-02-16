import type { Appointment, Doctor } from "@/data/types";
import fallbackAppointmentsJson from "@/data/original/appointments_1.json";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

const CACHE_KEY = 'autohealth_appointments_v1';
const PROJECT_KEY = 'web_14_autohealth';
let appointmentsCache: Appointment[] = [];
const FALLBACK_APPOINTMENTS: Appointment[] = Array.isArray(fallbackAppointmentsJson) ? (fallbackAppointmentsJson as Appointment[]) : [];

async function loadAppointmentsFromDataset(v2SeedValue?: number | null): Promise<Appointment[]> {
  await waitForDatasetSeed(v2SeedValue);
  const effectiveSeed = resolveDatasetSeed(v2SeedValue);
  const appointments = await fetchSeededSelection<Appointment>({
    projectKey: PROJECT_KEY,
    entityType: "appointments",
    seedValue: effectiveSeed,
    limit: 50,
    method: "distribute",
    filterKey: "specialty",
  });
  if (!Array.isArray(appointments) || appointments.length === 0) {
    throw new Error(`[autohealth] No appointments returned from dataset (seed=${effectiveSeed})`);
  }
  return appointments;
}

export async function initializeAppointments(doctors?: Doctor[], v2SeedValue?: number | null): Promise<Appointment[]> {
  const dbModeEnabled = isDbLoadModeEnabled();

  // Check base seed from URL - if seed = 1, use original data
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autohealth] Base seed is 1, using original appointments data (skipping DB mode)");
    appointmentsCache = FALLBACK_APPOINTMENTS;
    return appointmentsCache;
  }

  if (dbModeEnabled) {
    if (appointmentsCache.length > 0) return appointmentsCache;
    appointmentsCache = await loadAppointmentsFromDataset(v2SeedValue);
    return appointmentsCache;
  }

  appointmentsCache = FALLBACK_APPOINTMENTS;
  return appointmentsCache;
}
