/**
 * Class Selector for V3 Anti-Scraping (AutoCRM)
 *
 * Picks CSS class variants based on the v3 seed so DOM signatures keep changing.
 */

import classVariantsJson from "../data/class-variants.json";

const CLASS_VARIANTS_MAP: Record<string, string[]> = classVariantsJson;

function mapSeedToVariant(seed: number): number {
  if (!seed || seed < 1) return 0;
  return (seed - 1) % 10;
}

export function getClassForElement(
  seed: number,
  classType: string,
  fallback: string = ""
): string {
  const variants = CLASS_VARIANTS_MAP[classType];

  if (!variants || variants.length === 0) {
    return fallback;
  }

  const variantIndex = mapSeedToVariant(seed);
  return variants[variantIndex] || variants[0] || fallback;
}

export function getClassesForElements(
  seed: number,
  classTypes: string[]
): Record<string, string> {
  return classTypes.reduce((acc, classType) => {
    acc[classType] = getClassForElement(seed, classType);
    return acc;
  }, {} as Record<string, string>);
}

export function getAvailableClassTypes(): string[] {
  return Object.keys(CLASS_VARIANTS_MAP);
}

export function hasClassVariants(classType: string): boolean {
  return classType in CLASS_VARIANTS_MAP;
}
