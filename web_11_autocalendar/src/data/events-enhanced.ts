import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { EVENTS_DATASET, CalendarEvent } from "@/library/dataset";

const PROJECT_KEY = "web_11_autocalendar";
const ENTITY_TYPE = "calendar_events";

const clampSeed = (value?: number | null, fallback: number = 1): number =>
  typeof value === "number" && value >= 1 && value <= 300 ? value : fallback;

const readV2SeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("v2-seed");
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 300) {
      return parsed;
    }
  }
  try {
    const stored = localStorage.getItem("autocalendarV2Seed");
    if (stored) {
      const parsedStored = Number.parseInt(stored, 10);
      if (!Number.isNaN(parsedStored) && parsedStored >= 1 && parsedStored <= 300) {
        return parsedStored;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
};

export async function initializeEvents(v2Seed?: number | null): Promise<CalendarEvent[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  let effectiveSeed = 1;

  if (dbModeEnabled) {
    if (typeof window === "undefined") {
      effectiveSeed = 1;
    } else {
      const resolvedSeed = typeof v2Seed === "number" ? clampSeed(v2Seed, 1) : readV2SeedFromUrl();
      if (resolvedSeed === null) {
        throw new Error("[AutoCalendar] v2 is enabled but no v2-seed parameter was provided");
      }
      effectiveSeed = resolvedSeed;
    }
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
    console.error("[AutoCalendar] Failed to load events from dataset", error);
  }

  return EVENTS_DATASET as CalendarEvent[];
}

