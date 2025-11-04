// src/library/textVariants.ts
// Seed-based text variants for key UI elements

type ElementKey =
  | "experts-heading"
  | "jobs-heading"
  | "hires-heading"
  | "book-consultation-button-label"
  | "post-job-button-label"
  | "expert-message-button-label"
  | "stats-earnings-label"
  | "stats-jobs-label"
  | "stats-hours-label"
  | "sidebar-hours-label"
  | "sidebar-languages-label"
  | "sidebar-verifications-label"
  | "expert-hire-button-label"
  | "hire-cancel-button-label"
  | "hire-submit-button-label";

type TextVariantMap = Record<ElementKey, string>;
import jsonVariants from './textVariants.json';

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


