import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { Trip } from "@/library/dataset";

const clampSeed = (value: number, fallback: number = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

const readV2SeedFromClient = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("v2-seed");
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      return clampSeed(parsed);
    }
  }
  try {
    const stored = localStorage.getItem("autodrive_v2_seed");
    if (stored) {
      const parsedStored = Number.parseInt(stored, 10);
      if (!Number.isNaN(parsedStored)) {
        return clampSeed(parsedStored);
      }
    }
  } catch {
    // ignore storage issues
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
    const fromClient = readV2SeedFromClient();
    if (typeof fromClient === "number") {
      return fromClient;
    }
  }
  throw new Error("[autodrive] v2 is enabled but no valid v2-seed was provided");
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
