// src/library/textVariants.ts
type ElementKey =
  | "hero-title"
  | "hero-desc"
  | "hero-cta"
  | "card-appointments-title"
  | "card-appointments-desc"
  | "card-doctors-title"
  | "card-doctors-desc"
  | "card-prescriptions-title"
  | "card-prescriptions-desc"
  | "card-medical-records-title"
  | "card-medical-records-desc"
  | "mr-heading"
  | "mr-filter-all"
  | "mr-filter-diagnostic"
  | "mr-filter-preventive"
  | "mr-filter-treatment"
  | "mr-filter-monitoring"
  | "mr-upload-label"
  | "mr-upload-button"
  | "mr-files-note"
  | "mr-view-details"
  | "mr-modal-close"
  | "mr-modal-date"
  | "mr-modal-doctor"
  | "mr-modal-facility"
  | "mr-modal-status"
  | "mr-modal-description"
  | "mr-modal-results"
  | "mr-uploaded-heading"
  | "mr-view-record"
  | "apts-heading"
  | "apts-col-doctor"
  | "apts-col-specialty"
  | "apts-col-date"
  | "apts-col-time"
  | "apts-col-action"
  | "apts-book-button"
  | "apts-modal-title"
  | "apts-modal-desc-prefix"
  | "apts-modal-patient-info"
  | "apts-modal-name-label"
  | "apts-modal-name-ph"
  | "apts-modal-email-label"
  | "apts-modal-email-ph"
  | "apts-modal-phone-label"
  | "apts-modal-phone-ph"
  | "apts-modal-reason-label"
  | "apts-modal-reason-ph"
  | "apts-modal-insurance"
  | "apts-modal-ins-provider"
  | "apts-modal-ins-provider-ph"
  | "apts-modal-ins-number"
  | "apts-modal-ins-number-ph"
  | "apts-modal-emergency"
  | "apts-modal-em-name"
  | "apts-modal-em-name-ph"
  | "apts-modal-em-phone"
  | "apts-modal-em-phone-ph"
  | "apts-modal-notes"
  | "apts-modal-notes-label"
  | "apts-modal-notes-ph"
  | "apts-modal-cancel"
  | "apts-modal-confirm"
  | "apts-modal-booking"
  | "doctors-heading"
  | "view-profile-button"
  | "book-now-button"
  | "prescriptions-heading"
  | "presc-filter-all"
  | "presc-filter-active"
  | "presc-filter-completed"
  | "presc-filter-discontinued"
  | "presc-filter-refill"
  | "presc-col-medicine"
  | "presc-col-dosage"
  | "presc-col-doctor"
  | "presc-col-start"
  | "presc-col-status"
  | "presc-col-action"
  | "view-prescription-button"
  | "presc-modal-close"
  | "presc-details-heading"
  | "presc-label-dosage"
  | "presc-label-status"
  | "presc-label-start"
  | "presc-label-end"
  | "presc-label-doctor"
  | "presc-label-pharmacy"
  | "presc-label-number"
  | "presc-cost-heading"
  | "presc-label-cost"
  | "presc-label-insurance"
  | "presc-badge-covered"
  | "presc-badge-not-covered"
  | "presc-label-refills-remaining"
  | "presc-label-total-refills"
  | "presc-instructions-heading"
  | "presc-side-effects-heading"
  | "presc-warnings-heading"
  | "presc-request-refill";

type TextVariantMap = Record<ElementKey, string>;
import jsonVariants from './textVariants.json';

const VARIANTS: Record<number, Partial<TextVariantMap>> = Object.fromEntries(
  Object.entries(jsonVariants as Record<string, Partial<TextVariantMap>>).map(([k, v]) => [parseInt(k, 10), v])
);

function mapSeedToRange(seed: number): number {
  if (!seed || seed < 1 || seed > 300) return 1;
  return ((seed - 1) % 10) + 1;
}

export function getTextForElement(seed: number, key: ElementKey, fallback: string): string {
  const mapped = mapSeedToRange(seed);
  const variant = VARIANTS[mapped];
  return (variant && variant[key]) || fallback;
}

export type { ElementKey };


