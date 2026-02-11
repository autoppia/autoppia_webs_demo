import { generateProjectData, isDataGenerationEnabled } from '@/shared/data-generator';

export const isDataGenerationAvailable = () => isDataGenerationEnabled();

const DOCTOR_IFACE = `export interface Doctor { id: string; name: string; specialty: string; rating: number; bio?: string; }`;
const APPT_IFACE = `export interface Appointment { id: string; doctorId: string; doctorName: string; specialty: string; date: string; time: string; }`;
const RX_IFACE = `export interface Prescription { id: string; medicineName: string; genericName?: string; dosage: string; doctorName: string; startDate: string; endDate?: string; status: 'active'|'completed'|'discontinued'|'refill_needed'; category: string; }`;
const MR_IFACE = `export interface MedicalRecord { id: string; title: string; type: string; category: string; date: string; doctorName: string; status: 'normal'|'abnormal'|'pending'|'reviewed'; description?: string; }`;
const REVIEW_IFACE = `export interface Review { rating: number; comment: string; patientName: string; date: string; }`;

export async function generateDoctors(count = 12) {
  return await generateProjectData('web_14_autohealth', count, 'doctors', DOCTOR_IFACE, [
    { id: 'd1', name: 'Dr. Alice Lee', specialty: 'Cardiology', rating: 4.7 },
  ], `Generate realistic doctor profiles with specialties and ratings. IMPORTANT: We have profile images available for IDs "d1" through "d50". Please use sequential IDs in this range to ensure images are displayed.`);
}

export async function generateAppointments(count = 24, doctors: Array<{ id: string; name: string; specialty: string }> = []) {
  // Use actual generated doctors if available, otherwise use placeholder
  const exampleDoctor = doctors.length > 0
    ? doctors[0]
    : { id: 'd1', name: 'Dr. Alice Lee', specialty: 'Cardiology' };

  const additionalReqs = doctors.length > 0
    ? `IMPORTANT: Use ONLY the doctors from this list: ${JSON.stringify(doctors.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })))}. Each appointment must reference a doctor from this list by matching doctorId and doctorName.`
    : 'Generate realistic appointment slots tied to doctors.';

  return await generateProjectData('web_14_autohealth', count, 'appointments', APPT_IFACE, [
    { id: 'a1', doctorId: exampleDoctor.id, doctorName: exampleDoctor.name, specialty: exampleDoctor.specialty, date: '2025-07-09', time: '10:00 AM' },
  ], additionalReqs);
}

export async function generatePrescriptions(count = 30, doctors: Array<{ id: string; name: string; specialty: string }> = []) {
  // Use actual generated doctors if available, otherwise use placeholder
  const exampleDoctor = doctors.length > 0
    ? doctors[0]
    : { id: 'd1', name: 'Dr. Alice Lee', specialty: 'Cardiology' };

  const additionalReqs = doctors.length > 0
    ? `IMPORTANT: Use ONLY the doctors from this list: ${JSON.stringify(doctors.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })))}. Each prescription must reference a doctor from this list by matching doctorName.`
    : 'Generate realistic prescriptions with categories and statuses.';

  return await generateProjectData('web_14_autohealth', count, 'prescriptions', RX_IFACE, [
    { id: 'p1', medicineName: 'Atorvastatin', genericName: 'Lipitor', dosage: '10mg daily', doctorName: exampleDoctor.name, startDate: '2025-07-01', status: 'active', category: 'cholesterol' },
  ], additionalReqs);
}

export async function generateMedicalRecords(count = 24, doctors: Array<{ id: string; name: string; specialty: string }> = []) {
  // Use actual generated doctors if available, otherwise use placeholder
  const exampleDoctor = doctors.length > 0
    ? doctors[0]
    : { id: 'd1', name: 'Dr. Bob', specialty: 'General Medicine' };

  const additionalReqs = doctors.length > 0
    ? `IMPORTANT: Use ONLY the doctors from this list: ${JSON.stringify(doctors.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })))}. Each medical record must reference a doctor from this list by matching doctorName.`
    : 'Generate realistic medical records across categories.';

  return await generateProjectData('web_14_autohealth', count, 'medical_records', MR_IFACE, [
    { id: 'm1', title: 'CBC Panel', type: 'lab_result', category: 'diagnostic', date: '2025-07-05', doctorName: exampleDoctor.name, status: 'reviewed' },
  ], additionalReqs);
}

export async function generateDoctorReviews(
  doctor: { id: string; name: string; specialty?: string },
  count: number = 12
) {
  const examples = [
    { rating: 5, comment: `Excellent care by ${doctor.name}.`, patientName: 'John D.', date: '2025-06-01' },
  ];
  const req = `Generate diverse, natural patient reviews for ${doctor.name}${doctor.specialty ? ` (${doctor.specialty})` : ''}. Mix ratings (3-5), realistic dates (last 12 months), short names (first name + initial).`;
  return await generateProjectData('web_14_autohealth', count, 'doctor_reviews', REVIEW_IFACE, examples, req);
}

