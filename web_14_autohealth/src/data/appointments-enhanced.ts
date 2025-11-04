import type { Appointment } from '@/data/appointments';
import type { Doctor } from '@/data/doctors';
import { isDataGenerationAvailable, generateAppointments } from '@/utils/healthDataGenerator';

const CACHE_KEY = 'autohealth_appointments_v1';
const DOCTORS_CACHE_KEY = 'autohealth_doctors_v1';

export async function initializeAppointments(doctors?: Doctor[]): Promise<Appointment[]> {
  if (!isDataGenerationAvailable()) {
    const staticData = (await import('./appointments')).appointments as Appointment[];
    return staticData;
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) { try { return JSON.parse(raw) as Appointment[]; } catch {} }
  }
  
  // Get doctors if not provided
  let doctorsToUse = doctors;
  if (!doctorsToUse && typeof window !== 'undefined') {
    const doctorsRaw = localStorage.getItem(DOCTORS_CACHE_KEY);
    if (doctorsRaw) {
      try { doctorsToUse = JSON.parse(doctorsRaw) as Doctor[]; } catch {}
    }
  }
  
  const result = await generateAppointments(24, doctorsToUse?.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })) || []);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    const data = result.data as Appointment[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }
  const staticData = (await import('./appointments')).appointments as Appointment[];
  return staticData;
}

