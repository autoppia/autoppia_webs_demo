import type { Appointment, Doctor } from "@/data/types";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";

const CACHE_KEY = 'autohealth_appointments_v1';
const PROJECT_KEY = 'web_14_autohealth';
let appointmentsCache: Appointment[] = [];

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
    throw new Error(`[autohealth] No appointments returned from server (seed=${effectiveSeed})`);
  }
  return appointments;
}

export async function initializeAppointments(doctors?: Doctor[], v2SeedValue?: number | null): Promise<Appointment[]> {
  // Always call the server endpoint - server is the single source of truth
  if (appointmentsCache.length > 0) return appointmentsCache;

  try {
    appointmentsCache = await loadAppointmentsFromDataset(v2SeedValue);
    return appointmentsCache;
  } catch (error) {
    console.error("[autohealth] Failed to load appointments from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
