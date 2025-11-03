import { generateProjectData, isDataGenerationEnabled } from '@/shared/data-generator';

export const isDataGenerationAvailable = () => isDataGenerationEnabled();

export async function generateDoctors(count: number = 12) {
  return await generateProjectData('doctors', count);
}

export async function generateAppointments(count: number = 20) {
  return await generateProjectData('appointments', count);
}

export async function generatePrescriptions(count: number = 20) {
  return await generateProjectData('prescriptions', count);
}

export async function generateMedicalRecords(count: number = 20) {
  return await generateProjectData('medical_records', count);
}


