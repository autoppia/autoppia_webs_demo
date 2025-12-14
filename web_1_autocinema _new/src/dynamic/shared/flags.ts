/**
 * FLAGS - Control de habilitación de V1 y V3
 * 
 * V1: Estructura DOM (wrappers, decoys) - Rompe XPath
 * V3: Atributos y textos (IDs, clases, textos) - Anti-memorización
 */

/**
 * Verifica si V1 está habilitado
 * V1 añade wrappers y decoys al DOM para romper XPath
 */
export function isV1Enabled(): boolean {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === "true";
  }
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1 === "true";
}

/**
 * Verifica si V3 está habilitado
 * V3 cambia IDs, clases y textos para evitar memorización
 */
export function isV3Enabled(): boolean {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 === "true";
  }
  return process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3 === "true";
}
