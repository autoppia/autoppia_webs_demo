/**
 * Class Selector for V3 Anti-Scraping
 * 
 * Selects CSS class variants based on seed using pickVariant
 */

import classVariantsJson from '../data/class-variants.json';
import { pickVariant } from '../../shared/core';

const CLASS_VARIANTS_MAP: Record<string, string[]> = classVariantsJson;

/**
 * Get CSS class variant for a specific class type and seed
 * 
 * @param seed - The v3 seed
 * @param classType - Class type (e.g., 'button-primary', 'card', 'nav-link')
 * @param fallback - Fallback class if variant not found
 * @returns The class variant
 */
export function getClassForElement(
  seed: number,
  classType: string,
  fallback: string = ''
): string {
  const variants = CLASS_VARIANTS_MAP[classType];
  
  if (!variants || variants.length === 0) {
    return fallback;
  }
  
  // Seed 1 = versión original/base - siempre usar primera variante (índice 0)
  let variantIndex: number;
  if (seed === 1) {
    variantIndex = 0; // Primera variante = original
  } else {
    // Otros seeds: usar variantes dinámicas
    variantIndex = pickVariant(seed, classType, variants.length);
  }
  
  return variants[variantIndex] || variants[0] || fallback;
}

/**
 * Get multiple class variants at once
 * 
 * @param seed - The v3 seed
 * @param classTypes - Array of class types
 * @returns Object mapping class types to their variants
 */
export function getClassesForElements(
  seed: number,
  classTypes: string[]
): Record<string, string> {
  return classTypes.reduce((acc, classType) => {
    acc[classType] = getClassForElement(seed, classType);
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Get available class types
 */
export function getAvailableClassTypes(): string[] {
  return Object.keys(CLASS_VARIANTS_MAP);
}

/**
 * Check if a class type has variants
 */
export function hasClassVariants(classType: string): boolean {
  return classType in CLASS_VARIANTS_MAP;
}

