import type { LayoutVariant } from "./types";
import { DEFAULT_LAYOUT_VARIANT } from "./types";

/**
 * Returns the layout variant for the given seed.
 * Used by LayoutContext so layout is driven from @/dynamic.
 * Currently always returns the classic layout; can be extended for seed-based layout variants.
 */
export function getLayoutVariant(seed: number): LayoutVariant {
  // For now, single layout (classic). Future: use selectVariantIndex(seed, "layout", N) to pick variant.
  return DEFAULT_LAYOUT_VARIANT;
}
