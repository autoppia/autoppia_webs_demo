/**
 * Utilities to generate dynamic ordering of elements (V1)
 *
 * Generates different orders based on the seed without hardcoding every permutation.
 */

import { selectVariantIndex } from "../shared/core";

export function generateDynamicOrder(
  seed: number,
  key: string,
  count: number
): number[] {
  if (seed === 1) {
    return Array.from({ length: count }, (_, i) => i);
  }

  const orderVariants: number[][] = [];

  for (let offset = 0; offset < count; offset++) {
    const rotated = Array.from({ length: count }, (_, i) => (i + offset) % count);
    orderVariants.push(rotated);
  }

  for (let i = 0; i < count - 1; i++) {
    const swapped = Array.from({ length: count }, (_, j) => {
      if (j === i) return i + 1;
      if (j === i + 1) return i;
      return j;
    });
    if (!arraysEqual(swapped, Array.from({ length: count }, (_, j) => j))) {
      orderVariants.push(swapped);
    }
  }

  for (let split = 1; split < count; split++) {
    const reversed = [
      ...Array.from({ length: split }, (_, i) => split - 1 - i),
      ...Array.from({ length: count - split }, (_, i) => split + i)
    ];
    if (!arraysEqual(reversed, Array.from({ length: count }, (_, j) => j))) {
      orderVariants.push(reversed);
    }
  }

  const hashBased = generateHashBasedOrder(seed, key, count);
  if (!arraysEqual(hashBased, Array.from({ length: count }, (_, j) => j))) {
    orderVariants.push(hashBased);
  }

  const uniqueVariants = removeDuplicateOrders(orderVariants);

  if (uniqueVariants.length === 0) {
    return Array.from({ length: count }, (_, i) => i);
  }

  const variantIndex = selectVariantIndex(seed, key, uniqueVariants.length);
  return uniqueVariants[variantIndex];
}

function generateHashBasedOrder(seed: number, key: string, count: number): number[] {
  const combined = `${key}:${seed}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.abs(hash + i * 7919) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order;
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

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
