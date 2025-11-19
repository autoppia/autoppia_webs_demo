/**
 * ID Generator for V3 Anti-Scraping (AutoCRM)
 *
 * Maps the v3 seed to semantic, non-linear IDs so miners cannot rely on fixed attributes.
 */

import semanticIdsJson from "../data/semantic-ids.json";

const SEMANTIC_ID_MAP: Record<string, string[]> = semanticIdsJson;

/**
 * Map seed (1-300) to variant index (0-9)
 */
function mapSeedToVariant(seed: number): number {
  if (!seed || seed < 1) return 0;
  return (seed - 1) % 10;
}

/**
 * Generate a semantic ID for an element based on seed
 */
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

/**
 * Get all available element types
 */
export function getAvailableElementTypes(): string[] {
  return Object.keys(SEMANTIC_ID_MAP);
}

/**
 * Check if an element type has semantic variants
 */
export function hasSemanticVariants(elementType: string): boolean {
  return elementType in SEMANTIC_ID_MAP;
}
