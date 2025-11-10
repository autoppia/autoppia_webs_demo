import type { Prescription } from '@/data/prescriptions';
import type { Doctor } from '@/data/doctors';
import { isDataGenerationAvailable, generatePrescriptions } from '@/utils/healthDataGenerator';

const CACHE_KEY = 'autohealth_prescriptions_v1';
const DOCTORS_CACHE_KEY = 'autohealth_doctors_v1';

export async function initializePrescriptions(doctors?: Doctor[]): Promise<Prescription[]> {
  if (!isDataGenerationAvailable()) {
    const staticData = (await import('./prescriptions')).prescriptions as Prescription[];
    return staticData;
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) { try { return JSON.parse(raw) as Prescription[]; } catch {} }
  }
  
  // Get doctors if not provided
  let doctorsToUse = doctors;
  if (!doctorsToUse && typeof window !== 'undefined') {
    const doctorsRaw = localStorage.getItem(DOCTORS_CACHE_KEY);
    if (doctorsRaw) {
      try { doctorsToUse = JSON.parse(doctorsRaw) as Doctor[]; } catch {}
    }
  }
  
  const result = await generatePrescriptions(30, doctorsToUse?.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })) || []);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    const data = result.data as Prescription[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }
  const staticData = (await import('./prescriptions')).prescriptions as Prescription[];
  return staticData;
}

