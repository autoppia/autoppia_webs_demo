import type { MedicalRecord } from '@/data/medical-records';
import { isDataGenerationAvailable, generateMedicalRecords } from '@/utils/healthDataGenerator';

const CACHE_KEY = 'autohealth_medical_records_v1';

export async function initializeMedicalRecords(): Promise<MedicalRecord[]> {
  if (!isDataGenerationAvailable()) {
    const staticData = (await import('./medical-records')).medicalRecords as MedicalRecord[];
    return staticData;
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) { try { return JSON.parse(raw) as MedicalRecord[]; } catch {} }
  }
  const result = await generateMedicalRecords(24);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    const data = result.data as MedicalRecord[];
    if (typeof window !== 'undefined') localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }
  const staticData = (await import('./medical-records')).medicalRecords as MedicalRecord[];
  return staticData;
}

