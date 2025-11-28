import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { EVENTS_DATASET, CalendarEvent } from "@/library/dataset";
import { generateDeterministicEvents } from "@/data/seeded-events";

const PROJECT_KEY = "web_11_autocalendar";
const ENTITY_TYPE = "events";

const clampSeed = (value?: number | null, fallback: number = 1): number =>
  typeof value === "number" && value >= 1 && value <= 300 ? value : fallback;

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autocalendarV2Seed;
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 300
  ) {
    return value;
  }
  return null;
};

export async function initializeEvents(
  v2Seed?: number | null
): Promise<CalendarEvent[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  let effectiveSeed = clampSeed(v2Seed ?? 1, 1);

  if (dbModeEnabled) {
    if (typeof window === "undefined") {
      effectiveSeed = 1;
    } else {
      // Wait a bit for SeedContext to sync v2Seed to window
      await new Promise((resolve) => setTimeout(resolve, 100));
      const resolvedSeed =
        typeof v2Seed === "number" ? clampSeed(v2Seed, 1) : getRuntimeV2Seed();
      // Default to 1 if no v2-seed provided
      effectiveSeed = resolvedSeed ?? 1;
    }
  } else if (typeof v2Seed === "number") {
    effectiveSeed = clampSeed(v2Seed, 1);
  }

  const fallback = () =>
    generateDeterministicEvents(effectiveSeed, EVENTS_DATASET.length);

  if (!dbModeEnabled) {
    return fallback();
  }

  try {
    const events = await fetchSeededSelection<CalendarEvent>({
      projectKey: PROJECT_KEY,
      entityType: ENTITY_TYPE,
      seedValue: effectiveSeed,
      limit: 200,
      method: "shuffle",
    });
    if (Array.isArray(events) && events.length > 0) {
      return events;
    }
  } catch (error) {
    console.error(
      "[AutoCalendar] Failed to load events from dataset (seed:",
      effectiveSeed,
      ")",
      error
    );
  }

  // Deterministic per-seed fallback (changes when seed changes)
  return fallback();
}
