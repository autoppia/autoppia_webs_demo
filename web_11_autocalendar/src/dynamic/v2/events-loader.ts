import { fetchSeededSelection } from "@/shared/seeded-loader";
import { CalendarEvent } from "@/library/dataset";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

const PROJECT_KEY = "web_11_autocalendar";
const ENTITY_TYPE = "calendar_events";

export async function initializeEvents(
  v2Seed?: number | null
): Promise<CalendarEvent[]> {
  const effectiveSeed = isV2Enabled()
    ? clampSeed(v2Seed ?? getSeedFromUrl())
    : 1;

  // Always call the server endpoint - server determines whether v2 is enabled or disabled
  // When v2 is disabled, the server returns the original dataset
  try {
    const events = await fetchSeededSelection<CalendarEvent>({
      projectKey: PROJECT_KEY,
      entityType: ENTITY_TYPE,
      seedValue: effectiveSeed,
      limit: 50,
      method: "shuffle",
    });

    if (Array.isArray(events) && events.length > 0) {
      return events;
    }

    // If server returns empty array, throw error (no fallback)
    throw new Error(`Server returned empty array for seed ${effectiveSeed}`);
  } catch (error) {
    console.error(
      "[AutoCalendar] Failed to load calendar_events from server (seed:",
      effectiveSeed,
      ")",
      error
    );
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
