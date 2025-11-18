import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { Trip } from "@/library/dataset";

const clampSeed = (value: number, fallback: number = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autodriveV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

const resolveSeed = (
  dbEnabled: boolean,
  v2SeedValue?: number | null
): number => {
  if (!dbEnabled) {
    return 1;
  }
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampSeed(v2SeedValue);
  }
  if (typeof window !== "undefined") {
    // Wait a bit for SeedContext to sync v2Seed to window
    const fromClient = getRuntimeV2Seed();
    if (typeof fromClient === "number") {
      return fromClient;
    }
  }
  // Default to 1 if no v2-seed provided
  return 1;
};

/**
 * Initialize trips data for Web13 with deterministic pools.
 * Always load from the seeded dataset and throw when it is unavailable,
 * ensuring seed selections stay consistent across reloads.
 */
export async function initializeTrips(
  limit: number = 30,
  seedOverride?: number | null
): Promise<Trip[]> {
  const dbEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(dbEnabled, seedOverride);

  try {
    const trips = await fetchSeededSelection<Trip>({
      projectKey: "web_13_autodrive",
      entityType: "trips",
      seedValue: effectiveSeed,
      limit,
      method: "shuffle",
    });

    if (Array.isArray(trips) && trips.length > 0) {
      console.log(
        `[autodrive] Loaded ${trips.length} trips from dataset (seed=${effectiveSeed})`
      );
      return trips;
    }

    throw new Error(
      `[autodrive] No trips returned from dataset (seed=${effectiveSeed})`
    );
  } catch (error) {
    console.error("[autodrive] Failed to load trips from dataset", error);
    throw error;
  }
}
