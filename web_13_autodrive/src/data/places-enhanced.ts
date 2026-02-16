import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

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

const resolveSeed = (v2SeedValue?: number | null): number => {
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampBaseSeed(v2SeedValue);
  }

  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    return clampBaseSeed(baseSeed);
  }

  // Fallback to runtime seed if available
  if (typeof window !== "undefined") {
    const fromClient = getRuntimeV2Seed();
    if (typeof fromClient === "number") {
      return clampBaseSeed(fromClient);
    }
  }

  return 1;
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
  // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
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
