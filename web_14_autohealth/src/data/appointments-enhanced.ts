import type { Appointment } from '@/data/appointments';
import { isDataGenerationAvailable, generateAppointments } from '@/utils/healthDataGenerator';

const CACHE_KEY = 'autohealth_appointments_v1';

export async function initializeAppointments(): Promise<Appointment[]> {
  if (!isDataGenerationAvailable()) {
    const staticData = (await import('./appointments')).appointments as Appointment[];
    return staticData;
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) { try { return JSON.parse(raw) as Appointment[]; } catch {} }
  }
  const result = await generateAppointments(24);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    const data = result.data as Appointment[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }
  const staticData = (await import('./appointments')).appointments as Appointment[];
  return staticData;
}

