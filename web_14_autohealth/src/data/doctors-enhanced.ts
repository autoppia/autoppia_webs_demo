import { doctors as originalDoctors } from './doctors';
import { generateDoctors, isDataGenerationAvailable } from '@/utils/healthDataGenerator';

let currentDoctors = [...originalDoctors];

function readCache(): typeof originalDoctors | null {
  try {
    const raw = localStorage.getItem('autohealth_doctors_v1');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCache(data: typeof originalDoctors) {
  try { localStorage.setItem('autohealth_doctors_v1', JSON.stringify(data)); } catch {}
}

export async function initializeDoctors(): Promise<typeof originalDoctors> {
  if (!isDataGenerationAvailable()) {
    currentDoctors = [...originalDoctors];
    return currentDoctors;
  }

  const cached = readCache();
  if (cached && cached.length > 0) {
    currentDoctors = cached;
    return currentDoctors;
  }

  const result = await generateDoctors(12);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    currentDoctors = result.data as typeof originalDoctors;
    writeCache(currentDoctors);
  } else {
    currentDoctors = [...originalDoctors];
  }
  return currentDoctors;
}

export function getDoctors() { return currentDoctors; }


