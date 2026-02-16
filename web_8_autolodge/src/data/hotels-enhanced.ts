import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { Hotel } from "@/types/hotel";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { isV2Enabled } from "@/dynamic/shared/flags";

let hotelsCache: Hotel[] = [];

/**
 * Initialize hotels from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeHotels(seedOverride?: number | null): Promise<Hotel[]> {
  // V2 rule: seed always comes from URL, but if V2 is disabled we force seed=1.
  const seed = isV2Enabled()
    ? clampSeed(seedOverride ?? getSeedFromUrl())
    : 1;

  try {
    console.log("[hotels-enhanced] Fetching hotels from server with seed:", seed);
    const serverHotels = await fetchSeededSelection<Hotel>({
      projectKey: "web_8_autolodge",
      entityType: "hotels",
      seedValue: seed,
      limit: 50,
      method: "distribute",
      filterKey: "location"
    });

    if (Array.isArray(serverHotels) && serverHotels.length > 0) {
      console.log("[hotels-enhanced] Loaded", serverHotels.length, "hotels from server");
      hotelsCache = serverHotels;
      return hotelsCache;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[hotels-enhanced] Failed to fetch from server:", error);
    throw error;
  }
}
export {hotelsCache as hotels };
