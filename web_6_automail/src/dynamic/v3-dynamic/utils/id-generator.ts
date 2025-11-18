/**
 * ID Generator for V3 Anti-Scraping (AutoMail)
 */

import semanticIdsJson from "../data/semantic-ids.json";

const SEMANTIC_ID_MAP: Record<string, string[]> = semanticIdsJson;

function mapSeedToVariant(seed: number): number {
  if (!seed || seed < 1) return 0;
  return (seed - 1) % 10;
}

export function generateElementId(
  seed: number,
  elementType: string,
  index: number = 0
): string {
  const variants = SEMANTIC_ID_MAP[elementType];
  if (!variants || variants.length === 0) {
    return index > 0 ? `${elementType}-${index}` : elementType;
  }

  const variantIndex = mapSeedToVariant(seed);
  const baseId = variants[variantIndex] || variants[0];
  return index > 0 ? `${baseId}-${index}` : baseId;
}

export function getAvailableElementTypes(): string[] {
  return Object.keys(SEMANTIC_ID_MAP);
}

export function hasSemanticVariants(elementType: string): boolean {
  return elementType in SEMANTIC_ID_MAP;
}
