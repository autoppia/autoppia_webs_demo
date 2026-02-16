export type Review = { rating: number; comment: string; patientName: string; date: string };

function keyFor(doctorId: string) {
  return `autohealth_reviews_${doctorId}_v1`;
}

export async function initializeDoctorReviews(doctor: { id: string; name: string; specialty?: string }, forceGenerate: boolean = false): Promise<Review[]> {
  const cacheKey = keyFor(doctor.id);

  // Check cache first
  if (!forceGenerate && typeof window !== 'undefined') {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      try {
        const cached = JSON.parse(raw) as Review[];
        if (Array.isArray(cached) && cached.length > 0) {
          return cached;
        }
      } catch {}
    }
  }

  // Generate fallback reviews
  const fallback: Review[] = Array.from({ length: 8 }).map((_, i) => ({
    rating: 3 + Math.floor(Math.random() * 3),
    comment: `Great experience with ${doctor.name}. ${i % 2 === 0 ? 'Very professional.' : 'Would recommend.'}`,
    patientName: ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Sam', 'Casey', 'Avery', 'Drew'][i] + ' ' + ['K.', 'M.', 'R.', 'L.', 'D.'][i % 5],
    date: new Date(Date.now() - i * 86400000 * 12).toISOString().slice(0, 10),
  }));
  if (typeof window !== 'undefined') localStorage.setItem(cacheKey, JSON.stringify(fallback));
  return fallback;
}
