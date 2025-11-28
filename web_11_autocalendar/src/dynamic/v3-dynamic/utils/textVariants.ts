// src/library/textVariants.ts
type ElementKey =
  | "create-button-label"
  | "today-button-label"
  | "search-placeholder"
  | "add-calendar-title"
  | "add-calendar-submit"
  | "event-dialog-add-title"
  | "event-dialog-edit-title"
  | "wizard-back"
  | "wizard-next"
  | "wizard-save"
  | "wizard-delete"
  | "wizard-cancel"
  | "wizard-step-details"
  | "wizard-step-people"
  | "wizard-step-options"
  | "label-calendar"
  | "label-title"
  | "label-date"
  | "label-location"
  | "label-all-day"
  | "label-start-time"
  | "label-end-time"
  | "label-repeat"
  | "label-repeat-until"
  | "attendee-label"
  | "attendee-placeholder"
  | "attendee-add";

type TextVariantMap = Record<ElementKey, string>;
import jsonVariants from '../data/textVariants.json';

const VARIANTS: Record<number, TextVariantMap> = Object.fromEntries(
  Object.entries(jsonVariants as Record<string, TextVariantMap>).map(([k, v]) => [parseInt(k, 10), v])
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


