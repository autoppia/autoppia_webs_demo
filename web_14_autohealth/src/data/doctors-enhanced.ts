import type { Doctor } from '@/data/doctors';
import { isDataGenerationAvailable, generateDoctors } from '@/utils/healthDataGenerator';

const CACHE_KEY = 'autohealth_doctors_v1';

export async function initializeDoctors(): Promise<Doctor[]> {
  if (!isDataGenerationAvailable()) {
    const staticData = (await import('./doctors')).doctors as Doctor[];
    return staticData;
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try { return JSON.parse(raw) as Doctor[]; } catch {}
    }
  }
  const result = await generateDoctors(12);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    const data = result.data as Doctor[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }
  const staticData = (await import('./doctors')).doctors as Doctor[];
  return staticData;
}

