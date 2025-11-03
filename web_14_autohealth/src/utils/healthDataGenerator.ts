import { generateProjectData, isDataGenerationEnabled } from '@/shared/data-generator';

export const isDataGenerationAvailable = () => isDataGenerationEnabled();

const DOCTOR_IFACE = `export interface Doctor { id: string; name: string; specialty: string; rating: number; bio?: string; }`;
const APPT_IFACE = `export interface Appointment { id: string; doctorId: string; doctorName: string; specialty: string; date: string; time: string; }`;
const RX_IFACE = `export interface Prescription { id: string; medicineName: string; genericName?: string; dosage: string; doctorName: string; startDate: string; endDate?: string; status: 'active'|'completed'|'discontinued'|'refill_needed'; category: string; }`;
const MR_IFACE = `export interface MedicalRecord { id: string; title: string; type: string; category: string; date: string; doctorName: string; status: 'normal'|'abnormal'|'pending'|'reviewed'; description?: string; }`;

export async function generateDoctors(count = 12) {
  return await generateProjectData('web_14_autohealth', count, 'doctors', DOCTOR_IFACE, [
    { id: 'd1', name: 'Dr. Alice Lee', specialty: 'Cardiology', rating: 4.7 },
  ], 'Generate realistic doctor profiles with specialties and ratings.');
}

export async function generateAppointments(count = 24) {
  return await generateProjectData('web_14_autohealth', count, 'appointments', APPT_IFACE, [
    { id: 'a1', doctorId: 'd1', doctorName: 'Dr. Alice Lee', specialty: 'Cardiology', date: '2025-07-09', time: '10:00 AM' },
  ], 'Generate realistic appointment slots tied to doctors.');
}

export async function generatePrescriptions(count = 30) {
  return await generateProjectData('web_14_autohealth', count, 'prescriptions', RX_IFACE, [
    { id: 'p1', medicineName: 'Atorvastatin', genericName: 'Lipitor', dosage: '10mg daily', doctorName: 'Dr. Alice Lee', startDate: '2025-07-01', status: 'active', category: 'cholesterol' },
  ], 'Generate realistic prescriptions with categories and statuses.');
}

export async function generateMedicalRecords(count = 24) {
  return await generateProjectData('web_14_autohealth', count, 'medical_records', MR_IFACE, [
    { id: 'm1', title: 'CBC Panel', type: 'lab_result', category: 'diagnostic', date: '2025-07-05', doctorName: 'Dr. Bob', status: 'reviewed' },
  ], 'Generate realistic medical records across categories.');
}

