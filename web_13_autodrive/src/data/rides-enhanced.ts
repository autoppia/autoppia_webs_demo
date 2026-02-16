import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

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

// Normalize ride from JSON data
const normalizeRide = (ride: any): Ride => ({
  id: ride.id || `r-${Math.random().toString(36).slice(2, 9)}`,
  name: ride.name || "",
  image: ride.image || "/car1.png",
  icon: ride.icon || ride.image || "/car1.png",
  price: ride.price || 26.6,
  oldPrice: ride.oldPrice || ride.price * 1.2 || 32.0,
  seats: ride.seats || 4,
  eta: ride.eta || "2 min away",
  desc: ride.desc || "",
  recommended: ride.recommended || false,
  waitTime: ride.waitTime,
  perMile: ride.perMile,
  perMinute: ride.perMinute,
  features: ride.features,
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
 * Initialize rides data from server endpoint.
 * Server determines whether v2 is enabled or disabled.
 * When v2 is disabled, the server returns the original dataset.
 */
export async function initializeRides(
  v2SeedValue?: number | null,
  limit: number = 10
): Promise<Ride[]> {
  // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
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
