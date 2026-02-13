import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import { Hotel } from "@/types/hotel";

let fallbackHotels: Hotel[] = DASHBOARD_HOTELS as Hotel[];
try {
  const originalData = require("./original/hotels_1.json");
  if (Array.isArray(originalData) && originalData.length > 0) {
    fallbackHotels = originalData as Hotel[];
  }
} catch {
  // Use DASHBOARD_HOTELS
}

let hotelsCache: Hotel[] = [];

/**
 * Initialize hotels from base seed data (local JSON only).
 */
export async function initializeHotels(seedOverride?: number | null): Promise<Hotel[]> {
  const _seed = clampBaseSeed(seedOverride ?? getBaseSeedFromUrl());
  hotelsCache = (fallbackHotels as Hotel[]).map((h) => ({ ...h }));
  return hotelsCache;
}

/**
 * Clear cached hotel data
 */
export function clearHotelCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autolodge_generated_hotels_v1");
  }
}

export { hotelsCache as dynamicHotels, hotelsCache as hotels };
