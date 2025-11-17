import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import { Hotel } from "@/types/hotel";

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
    // If v2 is enabled, use the v2-seed provided OR default to 1
    effectiveSeed = v2SeedValue ?? 1;
  } else {
    // If v2 is NOT enabled, automatically use seed=1
    effectiveSeed = 1;
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
    throw err;
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
