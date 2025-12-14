/**
 * CORE - Funciones base compartidas por V1 y V3
 */

/**
 * Genera un hash determinístico de una cadena
 */
export function hashString(value: string): number {
  return value.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
}

/**
 * Selecciona una variante basada en seed y key
 * 
 * @param seed - El seed base (1-999)
 * @param key - Identificador único del componente
 * @param count - Número de variantes disponibles (devuelve 0 a count-1)
 * @returns Número de variante (0, 1, 2, ..., count-1)
 */
export function pickVariant(seed: number, key: string, count: number): number {
  if (count <= 1) return 0;
  return Math.abs(seed + hashString(key)) % count;
}

/**
 * Genera un ID único basado en seed y key
 */
export function generateId(seed: number, key: string, prefix = "dyn"): string {
  return `${prefix}-${key}-${Math.abs(seed + hashString(key)) % 9999}`;
}
