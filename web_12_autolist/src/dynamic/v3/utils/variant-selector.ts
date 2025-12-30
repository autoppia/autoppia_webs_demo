/**
 * Variant Selector for V3 Anti-Scraping
 *
 * Selects variants from local component dictionaries or global JSON files.
 * Always returns the first variant (original) for seed=1.
 */

import idVariantsJson from "../data/id-variants.json";
import classVariantsJson from "../data/class-variants.json";
import textVariantsJson from "../data/text-variants.json";
import { selectVariantIndex } from "../../shared/core";

export const ID_VARIANTS_MAP: Record<string, string[]> = idVariantsJson;
export const CLASS_VARIANTS_MAP: Record<string, string[]> = classVariantsJson;
export const TEXT_VARIANTS_MAP: Record<string, string[]> = textVariantsJson as Record<string, string[]>;

export function getVariant(
  seed: number,
  key: string,
  variants?: Record<string, string[]>,
  fallback?: string
): string {
  let selectedVariants: string[] | undefined;

  if (variants && key in variants) {
    selectedVariants = variants[key];
  } else if (!variants) {
    selectedVariants = ID_VARIANTS_MAP[key] || CLASS_VARIANTS_MAP[key] || TEXT_VARIANTS_MAP[key];
  }

  if (!selectedVariants || selectedVariants.length === 0) {
    if (fallback !== undefined) {
      return fallback;
    }
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn(`[variant-selector] No variants found for "${key}", using fallback: "${key}"`);
    }
    return key;
  }

  if (seed === 1) {
    return selectedVariants[0];
  }

  const variantIndex = selectVariantIndex(seed, key, selectedVariants.length);
  return selectedVariants[variantIndex] || selectedVariants[0];
}
