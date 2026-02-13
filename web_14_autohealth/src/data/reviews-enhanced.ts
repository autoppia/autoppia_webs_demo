import { isDataGenerationAvailable, generateDoctorReviews } from '@/utils/healthDataGenerator';

export type Review = { rating: number; comment: string; patientName: string; date: string };

function keyFor(doctorId: string) {
  return `autohealth_reviews_${doctorId}_v1`;
}

export async function initializeDoctorReviews(doctor: { id: string; name: string; specialty?: string }, forceGenerate: boolean = false): Promise<Review[]> {
  const cacheKey = keyFor(doctor.id);
  if (!isDataGenerationAvailable()) {
    return [];
  }
  if (!forceGenerate && typeof window !== 'undefined') {
    const raw = localStorage.getItem(cacheKey);
    if (raw) { try { return JSON.parse(raw) as Review[]; } catch {} }
  }
  const result = await generateDoctorReviews(doctor, 12);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    // Validate shape: require rating, comment, patientName, date
    const valid = (result.data as unknown[]).filter((r: any) =>
      r && typeof r === 'object' && typeof r.rating === 'number' && typeof r.comment === 'string' && typeof r.patientName === 'string' && typeof r.date === 'string'
    ) as Review[];
    if (valid.length > 0) {
      if (typeof window !== 'undefined') localStorage.setItem(cacheKey, JSON.stringify(valid));
      return valid;
    }
  }
  // Frontend fallback synthesis to avoid empty UI if backend can't generate
  const fallback: Review[] = Array.from({ length: 8 }).map((_, i) => ({
    rating: 3 + Math.floor(Math.random() * 3),
    comment: `Great experience with ${doctor.name}. ${i % 2 === 0 ? 'Very professional.' : 'Would recommend.'}`,
    patientName: ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Sam', 'Casey', 'Avery', 'Drew'][i] + ' ' + ['K.', 'M.', 'R.', 'L.', 'D.'][i % 5],
    date: new Date(Date.now() - i * 86400000 * 12).toISOString().slice(0, 10),
  }));
  if (typeof window !== 'undefined') localStorage.setItem(cacheKey, JSON.stringify(fallback));
  return fallback;
}
