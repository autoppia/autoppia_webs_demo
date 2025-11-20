import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a deterministic random number between 0 and 1 based on a seed string
 */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize to 0-1 range
  return Math.abs(hash) / 2147483647;
}

/**
 * Select a random item from an array based on a seed string
 */
export function seededRandomItem<T>(items: T[], seed: string): T {
  if (items.length === 0) {
    throw new Error("Cannot select from empty array");
  }
  const random = seededRandom(seed);
  const index = Math.floor(random * items.length);
  return items[index];
}
