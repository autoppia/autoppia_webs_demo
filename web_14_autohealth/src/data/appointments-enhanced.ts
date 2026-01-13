import type { Appointment, Doctor } from "@/data/types";
import fallbackAppointmentsJson from "@/data/original/appointments_1.json";
import { isDataGenerationAvailable, generateAppointments } from "@/utils/healthDataGenerator";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveDatasetSeed, waitForDatasetSeed } from "@/utils/v2Seed";

const CACHE_KEY = 'autohealth_appointments_v1';
const DOCTORS_CACHE_KEY = 'autohealth_doctors_v1';
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
  if (isDbLoadModeEnabled()) {
    if (appointmentsCache.length > 0) return appointmentsCache;
    appointmentsCache = await loadAppointmentsFromDataset(v2SeedValue);
    return appointmentsCache;
  }

  if (!isDataGenerationAvailable()) {
    appointmentsCache = FALLBACK_APPOINTMENTS;
    return appointmentsCache;
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        appointmentsCache = JSON.parse(raw) as Appointment[];
        if (appointmentsCache.length > 0) return appointmentsCache;
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
  
  const result = await generateAppointments(
    24,
    doctorsToUse?.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })) || []
  );
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    appointmentsCache = result.data as Appointment[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(appointmentsCache));
    return appointmentsCache;
  }
  appointmentsCache = FALLBACK_APPOINTMENTS;
  return appointmentsCache;
}
