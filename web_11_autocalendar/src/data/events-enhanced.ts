import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import { CalendarEvent } from "@/library/dataset";
import { fetchSeededSelection } from "@/shared/seeded-loader";

let eventsCache: CalendarEvent[] = [];

/**
 * Initialize events from server endpoint.
 * Server determines whether v2 is enabled or disabled.
 * When v2 is disabled, the server returns the original dataset.
 */
export async function initializeEvents(seedOverride?: number | null): Promise<CalendarEvent[]> {
  const seed = clampBaseSeed(seedOverride ?? getBaseSeedFromUrl());

  // Always call the server endpoint - server is the single source of truth
  try {
    console.log("[events-enhanced] Fetching events from server with seed:", seed);
    const serverEvents = await fetchSeededSelection<CalendarEvent>({
      projectKey: "web_11_autocalendar",
      entityType: "calendar_events",
      seedValue: seed,
      limit: 50,
      method: "shuffle",
    });

    if (Array.isArray(serverEvents) && serverEvents.length > 0) {
      console.log("[events-enhanced] Loaded", serverEvents.length, "events from server");
      eventsCache = serverEvents;
      return eventsCache;
    }

    // If server returns empty array, throw error (no fallback)
    throw new Error(`Server returned empty array for seed ${seed}`);
  } catch (error) {
    console.error("[events-enhanced] Failed to fetch from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
