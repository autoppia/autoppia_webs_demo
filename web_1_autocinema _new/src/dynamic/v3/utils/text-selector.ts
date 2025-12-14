/**
 * Text Selector for V3 Anti-Scraping
 * 
 * Selects text variants based on seed using pickVariant
 */

import textVariantsJson from '../data/text-variants.json';
import { pickVariant } from '../../shared/core';

type TextKey = string;
type TextVariantMap = Record<TextKey, string>;

// El JSON ya viene con las claves como strings, las mantenemos así
const VARIANTS: Record<string, TextVariantMap> = textVariantsJson as Record<string, TextVariantMap>;

// Obtener el número de variantes disponibles
const VARIANT_COUNT = Object.keys(VARIANTS).length;

/**
 * Get text variant for a specific key and seed
 * 
 * @param seed - The v3 seed
 * @param key - Text key (e.g., 'add_to_cart', 'search_placeholder')
 * @param fallback - Fallback text if variant not found
 * @returns The text variant
 */
export function getTextForElement(
  seed: number,
  key: TextKey,
  fallback: string
): string {
  // Usar pickVariant con el key como identificador para consistencia
  // El resultado es 0-based, pero VARIANTS usa claves 1-based (strings "1", "2", etc.), así que sumamos 1
  const variantIndex = pickVariant(seed, key, VARIANT_COUNT) + 1;
  const variant = VARIANTS[String(variantIndex)];
  
  return (variant && variant[key]) || fallback;
}

/**
 * Get all text variants for a specific seed
 */
export function getAllTextsForSeed(seed: number): TextVariantMap {
  // Usar un key genérico para obtener la variante del seed
  const variantIndex = pickVariant(seed, "text-variants", VARIANT_COUNT) + 1;
  return VARIANTS[String(variantIndex)] || VARIANTS["1"];
}

/**
 * Get available text keys
 */
export function getAvailableTextKeys(): TextKey[] {
  const firstVariant = VARIANTS["1"] || {};
  return Object.keys(firstVariant);
}

