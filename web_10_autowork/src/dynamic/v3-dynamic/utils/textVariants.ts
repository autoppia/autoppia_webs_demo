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
  | "hire-submit-button-label"
  | "job-title-heading"
  | "job-title-placeholder"
  | "wizard-step-skills-title"
  | "wizard-step-scope-title"
  | "wizard-step-title-title"
  | "wizard-step-budget-title"
  | "wizard-step-description-title"
  | "skill-search-label"
  | "skill-search-placeholder"
  | "add-skill-button-label"
  | "skills-helper-text"
  | "popular-skills-heading"
  | "scope-step-heading"
  | "duration-heading"
  | "job-description-heading"
  | "job-description-placeholder"
  | "attach-file-button-label"
  | "wizard-back-button-label"
  | "wizard-next-button-label"
  | "wizard-submit-button-label";

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


