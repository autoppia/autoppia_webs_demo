/**
 * Medical Specialties Constants
 *
 * This file contains all available medical specialties in the system.
 * These specialties are extracted from the doctors dataset and are used
 * throughout the application for filtering, autocomplete, and validation.
 */

export const MEDICAL_SPECIALTIES = [
  "Anesthesiology",
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Gastroenterology",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pathology",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
] as const;

/**
 * Get all medical specialties as a sorted array
 */
export function getAllSpecialties(): string[] {
  return [...MEDICAL_SPECIALTIES].sort();
}

/**
 * Filter specialties by search term (case-insensitive)
 */
export function filterSpecialties(searchTerm: string): string[] {
  if (!searchTerm.trim()) {
    return getAllSpecialties();
  }

  const term = searchTerm.toLowerCase();
  return MEDICAL_SPECIALTIES.filter(specialty =>
    specialty.toLowerCase().includes(term)
  );
}
