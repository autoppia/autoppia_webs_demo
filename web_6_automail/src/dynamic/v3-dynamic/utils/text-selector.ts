/**
 * Text Selector for V3 Anti-Scraping (AutoMail)
 */

import textVariantsJson from "../data/text-variants.json";

type TextVariantMap = Record<string, string>;

const VARIANTS: Record<number, TextVariantMap> = Object.fromEntries(
  Object.entries(textVariantsJson as Record<string, TextVariantMap>).map(
    ([key, value]) => [parseInt(key, 10), value]
  )
);

function mapSeedToVariant(seed: number): number {
  if (!seed || seed < 1 || seed > 300) return 1;
  return ((seed - 1) % 10) + 1;
}

export function getTextForElement(
  seed: number,
  key: string,
  fallback: string
): string {
  const variantIndex = mapSeedToVariant(seed);
  const variant = VARIANTS[variantIndex];
  return (variant && variant[key]) || fallback;
}

export function getAllTextsForSeed(seed: number): TextVariantMap {
  const variantIndex = mapSeedToVariant(seed);
  return VARIANTS[variantIndex] || VARIANTS[1];
}

export function getAvailableTextKeys(): string[] {
  return Object.keys(VARIANTS[1] || {});
}
