/**
 * V3 - ATRIBUTOS Y TEXTOS (IDs, Clases, Textos)
 * 
 * Cambia IDs, clases CSS y textos para evitar memorización.
 * Los scrapers que memorizan selectores fijos fallarán.
 * Funciona igual aunque V3 esté OFF (devuelve valores por defecto).
 */

import { isV3Enabled } from "../shared/flags";
import type { TextKey } from "../shared/types";

// Importar utilidades de V3
import { generateElementId } from "./utils/id-generator";
import { getTextForElement } from "./utils/text-selector";
import { getClassForElement } from "./utils/class-selector";

/**
 * Obtiene texto dinámico V3
 * Si V3 está OFF, devuelve fallback
 */
export function getV3Text(seed: number, key: TextKey, fallback: string): string {
  if (!isV3Enabled()) {
    return fallback; // Funciona igual, devuelve el texto original
  }
  return getTextForElement(seed, key, fallback);
}

/**
 * Obtiene ID dinámico V3
 * Si V3 está OFF, devuelve el ID por defecto
 */
export function getV3Id(seed: number, elementType: string, index: number = 0): string {
  if (!isV3Enabled()) {
    // Funciona igual, devuelve ID por defecto
    return index > 0 ? `${elementType}-${index}` : elementType;
  }
  return generateElementId(seed, elementType, index);
}

/**
 * Obtiene clase CSS dinámica V3
 * Si V3 está OFF, devuelve fallback
 */
export function getV3Class(seed: number, classType: string, fallback: string = ""): string {
  if (!isV3Enabled()) {
    return fallback; // Funciona igual, devuelve la clase original
  }
  return getClassForElement(seed, classType, fallback);
}
