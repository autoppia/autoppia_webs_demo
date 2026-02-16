import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

const PROJECT_KEY = "web_13_autodrive";
const ENTITY_TYPE = "rides";

// Ride type for the search page
export interface Ride {
  id: string;
  name: string;
  image: string;
  icon: string;
  price: number;
  oldPrice: number;
  seats: number;
  eta: string;
  desc: string;
  recommended: boolean;
  waitTime?: string;
  perMile?: number;
  perMinute?: number;
  features?: string[];
}

const resolveSeed = (v2SeedValue?: number | null): number => {
  return isV2Enabled()
    ? clampSeed(v2SeedValue ?? getSeedFromUrl())
    : 1;
};

/**
 * Initialize rides data from server endpoint.
 * Server determines whether v2 is enabled or disabled.
 * When v2 is disabled, the server returns the original dataset.
 */
export async function initializeRides(
  v2SeedValue?: number | null,
  limit: number = 10
): Promise<Ride[]> {
  const effectiveSeed = resolveSeed(v2SeedValue);

  // Always call the server endpoint - server is the single source of truth
  try {
    const rides = await fetchSeededSelection<Ride>({
      projectKey: PROJECT_KEY,
      entityType: ENTITY_TYPE,
      seedValue: effectiveSeed,
      limit: 50, // Fixed limit of 50 items for DB mode
      method: "shuffle",
    });

    if (Array.isArray(rides) && rides.length > 0) {
      console.log(
        `[autodrive] Loaded ${rides.length} rides from server (seed=${effectiveSeed})`
      );
      // Ensure at least one is recommended
      const ridesWithRecommended = rides.map((ride, idx) => ({
        ...ride,
        recommended: idx === 0 || ride.recommended || false,
      }));
      return ridesWithRecommended;
    }

    // If server returns empty array, throw error (no fallback)
    throw new Error(`Server returned empty array for seed ${effectiveSeed}`);
  } catch (error) {
    console.error("[autodrive] Failed to load rides from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
