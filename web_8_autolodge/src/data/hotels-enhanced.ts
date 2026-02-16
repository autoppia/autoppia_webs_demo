import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import { Hotel } from "@/types/hotel";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

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
 * Initialize hotels from server (when V2 is enabled) or local JSON (fallback).
 * When V2 is enabled, fetches from /datasets/load endpoint based on seed.
 */
export async function initializeHotels(seedOverride?: number | null): Promise<Hotel[]> {
  const seed = clampBaseSeed(seedOverride ?? getBaseSeedFromUrl());

  // If V2 is enabled, fetch from server endpoint
  if (isDbLoadModeEnabled()) {
    try {
      console.log("[hotels-enhanced] V2 enabled, fetching hotels from server with seed:", seed);
      const serverHotels = await fetchSeededSelection<Hotel>({
        projectKey: "web_8_autolodge",
        entityType: "hotels",
        seedValue: seed,
        limit: 50, // Adjust limit as needed
        method: "distribute",
        filterKey: "location"
      });

      if (Array.isArray(serverHotels) && serverHotels.length > 0) {
        console.log("[hotels-enhanced] Loaded", serverHotels.length, "hotels from server");
        hotelsCache = serverHotels;
        return hotelsCache;
      } else {
        console.warn("[hotels-enhanced] Server returned empty array, falling back to local data");
      }
    } catch (error) {
      console.error("[hotels-enhanced] Failed to fetch from server, falling back to local data:", error);
      // Fall through to local fallback
    }
  }

  // Fallback to local JSON data (when V2 is disabled or server fetch failed)
  console.log("[hotels-enhanced] Using local fallback data");
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
