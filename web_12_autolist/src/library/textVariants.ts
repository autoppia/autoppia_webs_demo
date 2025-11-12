// src/library/textVariants.ts
type ElementKey =
  | "cta-add-task"
  | "heading-inbox"
  | "heading-today"
  | "heading-completed"
  | "modal-edit-title"
  | "input-task-name-placeholder"
  | "input-description-placeholder"
  | "picker-date-label"
  | "picker-priority-label"
  | "button-cancel"
  | "button-add"
  | "button-save"
  | "empty-inbox-title"
  | "empty-inbox-desc"
  | "label-inbox"
  | "label-priority-badge";

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


