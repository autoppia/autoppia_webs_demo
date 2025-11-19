/**
 * Aria Label Selector for V3 Anti-Scraping (AutoMail)
 */

import ariaVariantsJson from "../data/aria-variants.json";

const ARIA_VARIANTS_MAP: Record<string, string[]> = ariaVariantsJson;

function mapSeedToVariant(seed: number): number {
  if (!seed || seed < 1) return 0;
  return (seed - 1) % 10;
}

export function getAriaLabelForElement(
  seed: number,
  key: string,
  fallback: string = ""
): string {
  const variants = ARIA_VARIANTS_MAP[key];
  if (!variants || variants.length === 0) {
    return fallback;
  }
  const variantIndex = mapSeedToVariant(seed);
  return variants[variantIndex] || variants[0] || fallback;
}

export function getAvailableAriaKeys(): string[] {
  return Object.keys(ARIA_VARIANTS_MAP);
}
