import { appointments as originalAppointments } from './appointments';
import { generateAppointments, isDataGenerationAvailable } from '@/utils/healthDataGenerator';

let currentAppointments = [...originalAppointments];

function readCache(): typeof originalAppointments | null {
  try { const raw = localStorage.getItem('autohealth_appointments_v1'); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function writeCache(data: typeof originalAppointments) {
  try { localStorage.setItem('autohealth_appointments_v1', JSON.stringify(data)); } catch {}
}

export async function initializeAppointments(): Promise<typeof originalAppointments> {
  if (!isDataGenerationAvailable()) { currentAppointments = [...originalAppointments]; return currentAppointments; }
  const cached = readCache();
  if (cached && cached.length > 0) { currentAppointments = cached; return currentAppointments; }
  const result = await generateAppointments(24);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    currentAppointments = result.data as typeof originalAppointments;
    writeCache(currentAppointments);
  } else {
    currentAppointments = [...originalAppointments];
  }
  return currentAppointments;
}

export function getAppointments() { return currentAppointments; }


