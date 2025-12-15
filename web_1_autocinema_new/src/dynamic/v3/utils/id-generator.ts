/**
 * ID Generator for V3 Anti-Scraping
 * 
 * Generates semantic, non-predictable IDs based on seed using pickVariant
 */

import idVariantsJson from '../data/id-variants.json';
import { pickVariant } from '../../shared/core';

const ID_VARIANTS_MAP: Record<string, string[]> = idVariantsJson;

/**
 * Generate a semantic ID for an element based on seed
 * 
 * @param seed - The v3 seed
 * @param elementType - Type of element (e.g., 'search-input', 'cart-button')
 * @param index - Optional index for multiple instances
 * @returns A semantic ID string
 */
export function generateElementId(
  seed: number,
  elementType: string,
  index: number = 0
): string {
  const variants = ID_VARIANTS_MAP[elementType];
  
  if (!variants || variants.length === 0) {
    // Fallback to basic ID
    const fallbackId = index > 0 ? `${elementType}-${index}` : elementType;
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn(`[id-generator] No variants found for "${elementType}", using fallback: "${fallbackId}"`);
    }
    return fallbackId;
  }
  
  // Usar pickVariant con el elementType como key para consistencia
  const variantIndex = pickVariant(seed, elementType, variants.length);
  const baseId = variants[variantIndex] || variants[0];
  
  // Add index suffix if needed
  const finalId = index > 0 ? `${baseId}-${index}` : baseId;
  
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && elementType === "stats-movies-card") {
    console.log(`[id-generator] Generated ID for "${elementType}":`, {
      seed,
      variantIndex,
      baseId,
      finalId,
      availableVariants: variants.length
    });
  }
  
  return finalId;
}

/**
 * Get all available element types
 */
export function getAvailableElementTypes(): string[] {
  return Object.keys(ID_VARIANTS_MAP);
}

/**
 * Check if an element type has semantic variants
 */
export function hasSemanticVariants(elementType: string): boolean {
  return elementType in ID_VARIANTS_MAP;
}

