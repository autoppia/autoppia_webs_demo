/**
 * LAYOUT FIJO - Siempre como seed 6 (Layout C)
 * Tu sitio web es lo que es, sin variaciones
 * La seed en la URL se mantiene pero no afecta el layout
 */

export interface SeedLayoutConfig {
  // Layout variations
  marginTop: number;
  wrapButton: boolean;
  justifyClass: string;
  gapClass: string;
  marginTopClass: string;
  marginBottomClass: string;
}

// LAYOUT FIJO COMO SEED 6 - Siempre estos valores
const FIXED_LAYOUT_SEED_6: SeedLayoutConfig = {
  marginTop: 0,
  wrapButton: false,
  justifyClass: "justify-start",
  gapClass: "gap-2",
  marginTopClass: "mt-0",
  marginBottomClass: "mb-0",
};

export function isDynamicEnabled(): boolean {
  return false; // Siempre deshabilitado - el layout nunca cambia
}

export function getEffectiveLayoutConfig(seed?: number): SeedLayoutConfig {
  // Siempre devolver el layout fijo de seed 6, ignorando la seed
  return FIXED_LAYOUT_SEED_6;
}

export function getLayoutClasses(seed?: number): string {
  // Siempre las mismas clases
  return "justify-start gap-2 mt-0 mb-0";
}

export function getSeedLayout(seed?: number): SeedLayoutConfig {
  // Siempre el mismo layout
  return FIXED_LAYOUT_SEED_6;
}

