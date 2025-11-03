import { medicalRecords as originalRecords } from './medical-records';
import { generateMedicalRecords, isDataGenerationAvailable } from '@/utils/healthDataGenerator';

let currentRecords = [...originalRecords];

function readCache(): typeof originalRecords | null {
  try { const raw = localStorage.getItem('autohealth_medical_records_v1'); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function writeCache(data: typeof originalRecords) {
  try { localStorage.setItem('autohealth_medical_records_v1', JSON.stringify(data)); } catch {}
}

export async function initializeMedicalRecords(): Promise<typeof originalRecords> {
  if (!isDataGenerationAvailable()) { currentRecords = [...originalRecords]; return currentRecords; }
  const cached = readCache();
  if (cached && cached.length > 0) { currentRecords = cached; return currentRecords; }
  const result = await generateMedicalRecords(24);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    currentRecords = result.data as typeof originalRecords;
    writeCache(currentRecords);
  } else {
    currentRecords = [...originalRecords];
  }
  return currentRecords;
}

export function getMedicalRecords() { return currentRecords; }


