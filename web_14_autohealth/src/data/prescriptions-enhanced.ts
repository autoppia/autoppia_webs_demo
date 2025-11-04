import type { Prescription } from '@/data/prescriptions';
import { isDataGenerationAvailable, generatePrescriptions } from '@/utils/healthDataGenerator';

const CACHE_KEY = 'autohealth_prescriptions_v1';

export async function initializePrescriptions(): Promise<Prescription[]> {
  if (!isDataGenerationAvailable()) {
    const staticData = (await import('./prescriptions')).prescriptions as Prescription[];
    return staticData;
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) { try { return JSON.parse(raw) as Prescription[]; } catch {} }
  }
  const result = await generatePrescriptions(30);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    const data = result.data as Prescription[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }
  const staticData = (await import('./prescriptions')).prescriptions as Prescription[];
  return staticData;
}

