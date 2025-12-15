/**
 * Variant Selector for V3 Anti-Scraping
 * 
 * Selects variants from local component dictionaries or global JSON files
 * Always returns the first variant (original) for seed=1
 */

import idVariantsJson from '../data/id-variants.json';
import classVariantsJson from '../data/class-variants.json';
import textVariantsJson from '../data/text-variants.json';
import { pickVariant } from '../../shared/core';

export const ID_VARIANTS_MAP: Record<string, string[]> = idVariantsJson;
export const CLASS_VARIANTS_MAP: Record<string, string[]> = classVariantsJson;

// Text variants: estructura nueva donde cada key tiene su array de variantes
// Si el JSON viene en formato antiguo (seed-based), lo convertimos
let TEXT_VARIANTS_MAP: Record<string, string[]> = {};

// Detectar si el JSON está en formato antiguo (seed-based) o nuevo (key-based)
const firstKey = Object.keys(textVariantsJson)[0];
if (firstKey && typeof (textVariantsJson as any)[firstKey] === 'object' && !Array.isArray((textVariantsJson as any)[firstKey])) {
  // Formato antiguo: { "1": { "key1": "...", "key2": "..." }, "2": { ... } }
  // Convertir a formato nuevo: { "key1": ["...", "...", ...], "key2": [...] }
  const oldFormat = textVariantsJson as Record<string, Record<string, string>>;
  const allKeys = new Set<string>();
  
  // Recopilar todas las keys únicas
  Object.values(oldFormat).forEach(variant => {
    Object.keys(variant).forEach(key => allKeys.add(key));
  });
  
  // Convertir a nuevo formato
  allKeys.forEach(key => {
    TEXT_VARIANTS_MAP[key] = Object.values(oldFormat)
      .map(variant => variant[key])
      .filter((text): text is string => text !== undefined && text !== null);
  });
} else {
  // Formato nuevo: { "key1": ["...", "...", ...], "key2": [...] }
  TEXT_VARIANTS_MAP = textVariantsJson as Record<string, string[]>;
}

export { TEXT_VARIANTS_MAP };

/**
 * Get a variant from a dictionary or global JSONs
 * 
 * Works for IDs, classes, and texts - all use the same structure!
 * 
 * Simple logic:
 * - If you pass a dictionary, it searches there
 * - If you don't pass a dictionary, it searches in id-variants.json, class-variants.json, and text-variants.json
 * 
 * @param seed - The seed value
 * @param key - The key to look up
 * @param variants - Optional dictionary to search in (can be local component dict or global JSON like ID_VARIANTS_MAP)
 * @param fallback - Fallback value if no variants found
 * @returns The selected variant string
 */
export function getVariant(
  seed: number,
  key: string,
  variants?: Record<string, string[]>,
  fallback?: string
): string {
  let selectedVariants: string[] | undefined;

  // 1. If dictionary is provided, search there
  if (variants && key in variants) {
    selectedVariants = variants[key];
  } else if (!variants) {
    // 2. If no dictionary provided, search in all global JSONs (IDs, classes, texts)
    selectedVariants = ID_VARIANTS_MAP[key] || CLASS_VARIANTS_MAP[key] || TEXT_VARIANTS_MAP[key];
  }

  // 3. If no variants found, return fallback or key itself
  if (!selectedVariants || selectedVariants.length === 0) {
    if (fallback !== undefined) {
      return fallback;
    }
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn(
        `[variant-selector] No variants found for "${key}", using fallback: "${key}"`
      );
    }
    return key;
  }

  // 4. Select variant based on seed
  if (seed === 1) {
    return selectedVariants[0]; // seed=1 = original (first variant)
  }

  const variantIndex = pickVariant(seed, key, selectedVariants.length);
  return selectedVariants[variantIndex] || selectedVariants[0];
}

/**
 * Get multiple variants at once from a dictionary or global JSONs
 * 
 * @param seed - The seed value
 * @param keys - Array of keys to look up
 * @param variants - Optional dictionary to search in
 * @returns Object mapping keys to their selected variants
 */
export function getVariants(
  seed: number,
  keys: string[],
  variants?: Record<string, string[]>
): Record<string, string> {
  return keys.reduce((acc, key) => {
    acc[key] = getVariant(seed, key, variants);
    return acc;
  }, {} as Record<string, string>);
}

