/**
 * Utilidades para generar órdenes dinámicos de elementos
 * 
 * Genera órdenes diferentes según el seed sin necesidad de hardcodear todas las permutaciones
 */

import { pickVariant } from "./core";

/**
 * Genera un orden dinámico para un array de elementos
 * 
 * @param seed - Seed base (1-999)
 * @param key - Identificador único para este conjunto de elementos (ej: "featured-movies", "stats-cards")
 * @param count - Número de elementos (ej: 3, 4, 6)
 * @returns Array de índices reordenados (ej: [0,1,2] o [2,0,1] para count=3)
 */
export function generateDynamicOrder(
  seed: number,
  key: string,
  count: number
): number[] {
  // Seed 1 = orden original (0, 1, 2, ..., count-1)
  if (seed === 1) {
    return Array.from({ length: count }, (_, i) => i);
  }

  // Para otros seeds, generar orden dinámico
  // Usamos una función hash determinística para generar el orden
  
  // Generar múltiples variantes de orden usando diferentes offsets
  const orderVariants: number[][] = [];
  
  // Generar variantes usando diferentes estrategias:
  // 1. Rotaciones
  for (let offset = 0; offset < count; offset++) {
    const rotated = Array.from({ length: count }, (_, i) => (i + offset) % count);
    orderVariants.push(rotated);
  }
  
  // 2. Intercambios de pares
  for (let i = 0; i < count - 1; i++) {
    const swapped = Array.from({ length: count }, (_, j) => {
      if (j === i) return i + 1;
      if (j === i + 1) return i;
      return j;
    });
    // Solo añadir si es diferente del orden original
    if (!arraysEqual(swapped, Array.from({ length: count }, (_, j) => j))) {
      orderVariants.push(swapped);
    }
  }
  
  // 3. Inversiones parciales
  for (let split = 1; split < count; split++) {
    const reversed = [
      ...Array.from({ length: split }, (_, i) => split - 1 - i),
      ...Array.from({ length: count - split }, (_, i) => split + i)
    ];
    if (!arraysEqual(reversed, Array.from({ length: count }, (_, j) => j))) {
      orderVariants.push(reversed);
    }
  }
  
  // 4. Shuffle determinístico usando hash
  const hashBased = generateHashBasedOrder(seed, key, count);
  if (!arraysEqual(hashBased, Array.from({ length: count }, (_, j) => j))) {
    orderVariants.push(hashBased);
  }
  
  // Eliminar duplicados
  const uniqueVariants = removeDuplicateOrders(orderVariants);
  
  // Si no hay variantes, devolver orden original
  if (uniqueVariants.length === 0) {
    return Array.from({ length: count }, (_, i) => i);
  }
  
  // Seleccionar variante usando pickVariant
  const variantIndex = pickVariant(seed, key, uniqueVariants.length);
  return uniqueVariants[variantIndex];
}

/**
 * Genera un orden basado en hash para máxima variación
 */
function generateHashBasedOrder(seed: number, key: string, count: number): number[] {
  // Combinar seed y key para generar hash
  const combined = `${key}:${seed}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Generar orden usando Fisher-Yates shuffle determinístico
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.abs(hash + i * 7919) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  
  return order;
}

/**
 * Compara dos arrays para ver si son iguales
 */
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

/**
 * Elimina órdenes duplicados de un array
 */
function removeDuplicateOrders(orders: number[][]): number[][] {
  const seen = new Set<string>();
  const unique: number[][] = [];
  
  for (const order of orders) {
    const key = order.join(',');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(order);
    }
  }
  
  return unique;
}
