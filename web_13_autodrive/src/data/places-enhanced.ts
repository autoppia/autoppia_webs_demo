import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import fallbackPlacesData from "./original/places_1.json";

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

// Normalize places from JSON data
const normalizePlace = (place: any): Place => ({
  id: place.id || `pl-${Math.random().toString(36).slice(2, 9)}`,
  label: place.label || "",
  main: place.main || "",
  sub: place.sub || "",
  category: place.category,
  latitude: place.latitude,
  longitude: place.longitude,
});

// Fallback places data from JSON
const fallbackPlaces: Place[] = (fallbackPlacesData as any[]).map(normalizePlace);

const clampSeed = (value: number, fallback: number = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as Window & { __autodriveV2Seed?: number | null }).__autodriveV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

const resolveSeed = (dbModeEnabled: boolean, v2SeedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }

  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampSeed(v2SeedValue);
  }

  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    // If base seed is 1, v2 should also be 1
    if (baseSeed === 1) {
      return 1;
    }

    // For other seeds, use base seed directly (v2 seed = base seed)
    return clampSeed(baseSeed);
  }

  // Fallback to runtime seed if available
  if (typeof window !== "undefined") {
    const fromClient = getRuntimeV2Seed();
    if (typeof fromClient === "number") {
      return clampSeed(fromClient);
    }
  }

  return 1;
};

/**
 * Initialize places data for Web13.
 * Priority: DB → AI → Fallback (original data)
 */
export async function initializePlaces(
  v2SeedValue?: number | null,
  limit: number = 50
): Promise<Place[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autodrive] Base seed is 1, using original places data (skipping DB/AI modes)");
    return fallbackPlaces;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

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
          `[autodrive] Loaded ${places.length} places from dataset (seed=${effectiveSeed})`
        );
        return places;
      }

      // If no places returned from backend, fallback to original data
      console.warn(`[autodrive] No places returned from backend (seed=${effectiveSeed}), falling back to original data`);
    } catch (error) {
      // If backend fails, fallback to original data
      console.warn("[autodrive] Backend unavailable for places, falling back to original data:", error);
    }
  }
  // Priority 2: Fallback - use original data
  else {
    console.log("[autodrive] V2 modes disabled for places, using original data");
  }

  // Fallback to original data
  return fallbackPlaces;
}
