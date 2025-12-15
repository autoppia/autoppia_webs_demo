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
  // En Next.js, las variables NEXT_PUBLIC_* están disponibles tanto en servidor como cliente
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V1;
  const enabled = value === "true" || value === true;
  
  // Debug en desarrollo
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V1 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V1=true");
    }
  }
  
  return enabled;
}

/**
 * Verifica si V3 está habilitado
 * V3 cambia IDs, clases y textos para evitar memorización
 */
export function isV3Enabled(): boolean {
  // En Next.js, las variables NEXT_PUBLIC_* están disponibles tanto en servidor como cliente
  const value = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V3;
  const enabled = value === "true" || value === true;
  
  // Debug en desarrollo
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!enabled) {
      console.warn("[dynamic] V3 está deshabilitado. Para habilitarlo, configura NEXT_PUBLIC_ENABLE_DYNAMIC_V3=true");
    }
  }
  
  return enabled;
}
