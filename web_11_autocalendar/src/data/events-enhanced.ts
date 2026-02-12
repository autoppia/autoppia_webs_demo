import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { CalendarEvent, EVENTS_DATASET } from "@/library/dataset";

const PROJECT_KEY = "web_11_autocalendar";
const ENTITY_TYPE = "events";

const clampSeed = (value: number, fallback = 1): number => {
  if (Number.isNaN(value)) return fallback;
  if (value < 1) return fallback;
  if (value > 300) return fallback;
  return value;
};

const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) {
      return clampBaseSeed(parsed);
    }
  }
  return null;
};

const resolveSeed = (dbModeEnabled: boolean, seedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampSeed(seedValue);
  }
  
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    const resolvedSeeds = resolveSeedsSync(baseSeed);
    if (resolvedSeeds.v2 !== null) {
      return resolvedSeeds.v2;
    }
    return clampSeed(baseSeed);
  }
  
  return 1;
};

export async function initializeEvents(v2SeedValue?: number | null, limit = 200): Promise<CalendarEvent[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autocalendar] Base seed is 1, using original data (skipping DB/AI modes)");
    return EVENTS_DATASET.map((e) => ({ ...e }));
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

    try {
      const events = await fetchSeededSelection<CalendarEvent>({
        projectKey: PROJECT_KEY,
        entityType: ENTITY_TYPE,
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "shuffle",
      });

      if (Array.isArray(events) && events.length > 0) {
        console.log(
          `[autocalendar] Loaded ${events.length} events from dataset (seed=${effectiveSeed})`
        );
        return events;
      }

      // If no events returned from backend, fallback to local JSON
      console.warn(`[autocalendar] No events returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      // If backend fails, fallback to local JSON
      console.warn("[autocalendar] Backend unavailable, falling back to local JSON:", error);
    }
  }

  // Fallback to local JSON
  return EVENTS_DATASET.map((e) => ({ ...e }));
}
