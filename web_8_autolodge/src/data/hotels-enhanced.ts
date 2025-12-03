import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import { Hotel } from "@/types/hotel";
import fallbackHotels from "./original/hotels_1.json";

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autolodgeV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

/**
 * Initialize hotels data from database with v2-seed support
 */
export async function initializeHotels(v2SeedValue?: number | null): Promise<Hotel[]> {
  // Check if v2 (DB mode) is enabled
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}

  // Determine the seed to use
  let effectiveSeed: number;
  
  if (dbModeEnabled) {
    // Wait a bit for SeedContext to sync v2Seed to window if needed
    if (typeof window !== "undefined") {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // If v2 is enabled, use the v2-seed provided OR from window OR default to 1
    effectiveSeed = v2SeedValue ?? getRuntimeV2Seed() ?? 1;
  } else {
    // If v2 is NOT enabled, automatically use seed=1 and skip DB
    effectiveSeed = 1;
    console.log("[autolodge] DB mode disabled, using static fallback data (seed=1)");
    return (fallbackHotels as Hotel[]).map((h) => ({ ...h }));
  }

  // Load from DB with the determined seed
  try {
    const fromDb = await fetchSeededSelection<Hotel>({
      projectKey: "web_8_autolodge",
      entityType: "hotels",
      seedValue: effectiveSeed,
      limit: 50,
      method: "distribute",
      filterKey: "location",
    });
    
    console.log(`[autolodge] Fetched from DB with seed=${effectiveSeed}:`, fromDb);
    
    if (fromDb && fromDb.length > 0) {
      return fromDb;
    } else {
      console.warn(`[autolodge] No data returned from DB with seed=${effectiveSeed}`);
      throw new Error(`[autolodge] No data found for seed=${effectiveSeed}`);
    }
  } catch (err) {
    console.error(`[autolodge] Failed to load from DB with seed=${effectiveSeed}:`, err);
    console.log("[autolodge] Falling back to static hotels dataset");
    return (fallbackHotels as Hotel[]).map((h) => ({ ...h }));
  }
}

/**
 * Clear cached hotel data
 */
export function clearHotelCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autolodge_generated_hotels_v1");
    console.log('🗑️ Cleared hotel cache');
  }
}
