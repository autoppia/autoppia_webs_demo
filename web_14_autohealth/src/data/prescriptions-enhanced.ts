import { prescriptions as originalPrescriptions } from './prescriptions';
import { generatePrescriptions, isDataGenerationAvailable } from '@/utils/healthDataGenerator';

let currentPrescriptions = [...originalPrescriptions];

function readCache(): typeof originalPrescriptions | null {
  try { const raw = localStorage.getItem('autohealth_prescriptions_v1'); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function writeCache(data: typeof originalPrescriptions) {
  try { localStorage.setItem('autohealth_prescriptions_v1', JSON.stringify(data)); } catch {}
}

export async function initializePrescriptions(): Promise<typeof originalPrescriptions> {
  if (!isDataGenerationAvailable()) { currentPrescriptions = [...originalPrescriptions]; return currentPrescriptions; }
  const cached = readCache();
  if (cached && cached.length > 0) { currentPrescriptions = cached; return currentPrescriptions; }
  const result = await generatePrescriptions(30);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    currentPrescriptions = result.data as typeof originalPrescriptions;
    writeCache(currentPrescriptions);
  } else {
    currentPrescriptions = [...originalPrescriptions];
  }
  return currentPrescriptions;
}

export function getPrescriptions() { return currentPrescriptions; }


