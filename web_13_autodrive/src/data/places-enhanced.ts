import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

const PROJECT_KEY = "web_13_autodrive";
const ENTITY_TYPE = "places";

// Place type for extensibility
export interface Place {
  id: string;
  label: string;
  main: string;
  sub: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

const resolveSeed = (v2SeedValue?: number | null): number => {
  return isV2Enabled()
    ? clampSeed(v2SeedValue ?? getSeedFromUrl())
    : 1;
};

/**
 * Initialize places data from server endpoint.
 * Server determines whether v2 is enabled or disabled.
 * When v2 is disabled, the server returns the original dataset.
 */
export async function initializePlaces(
  v2SeedValue?: number | null,
  limit: number = 50
): Promise<Place[]> {
  const effectiveSeed = resolveSeed(v2SeedValue);

  // Always call the server endpoint - server is the single source of truth
  try {
    const places = await fetchSeededSelection<Place>({
      projectKey: PROJECT_KEY,
      entityType: ENTITY_TYPE,
      seedValue: effectiveSeed,
      limit: 50, // Fixed limit of 50 items for DB mode
      method: "shuffle",
    });

    if (Array.isArray(places) && places.length > 0) {
      console.log(
        `[autodrive] Loaded ${places.length} places from server (seed=${effectiveSeed})`
      );
      return places;
    }

    // If server returns empty array, throw error (no fallback)
    throw new Error(`Server returned empty array for seed ${effectiveSeed}`);
  } catch (error) {
    console.error("[autodrive] Failed to load places from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
