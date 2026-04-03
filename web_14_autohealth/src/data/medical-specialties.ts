import type { Appointment, Doctor, MedicalRecord } from "@/data/types";

/**
 * Unique specialties from the doctors currently loaded from the web dataset.
 */
export function deriveSpecialtiesFromDoctors(doctors: Doctor[]): string[] {
  const set = new Set<string>();
  for (const d of doctors) {
    const primary = d.specialty?.trim();
    if (primary) set.add(primary);
    for (const s of d.specialties ?? []) {
      const t = typeof s === "string" ? s.trim() : "";
      if (t) set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * Specialties implied by appointment rows plus doctors who appear on medical records
 * (same sources as the Appointments and Medical Analysis pages).
 */
export function deriveSpecialtiesFromAppointmentAndRecordData(
  appointments: Appointment[],
  medicalRecords: MedicalRecord[],
  doctors: Doctor[],
): string[] {
  const set = new Set<string>();
  for (const a of appointments) {
    const s = a.specialty?.trim();
    if (s) set.add(s);
  }

  const byNameLower = new Map<string, Doctor>();
  for (const d of doctors) {
    const k = d.name.trim().toLowerCase();
    if (!byNameLower.has(k)) byNameLower.set(k, d);
  }

  for (const r of medicalRecords) {
    const name = r.doctorName?.trim();
    if (!name) continue;
    const d = byNameLower.get(name.toLowerCase());
    if (!d) continue;
    const primary = d.specialty?.trim();
    if (primary) set.add(primary);
    for (const s of d.specialties ?? []) {
      const t = typeof s === "string" ? s.trim() : "";
      if (t) set.add(t);
    }
  }

  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterSpecialtiesList(specialties: string[], searchTerm: string): string[] {
  if (!searchTerm.trim()) {
    return [...specialties].sort((a, b) => a.localeCompare(b));
  }
  const term = searchTerm.toLowerCase();
  return specialties.filter((s) => s.toLowerCase().includes(term));
}
