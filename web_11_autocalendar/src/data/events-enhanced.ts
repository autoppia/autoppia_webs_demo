import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import { CalendarEvent, EVENTS_DATASET } from "@/library/dataset";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

// Import fallback data - check if original directory exists
let fallbackEvents: CalendarEvent[] = EVENTS_DATASET as CalendarEvent[];
try {
  const originalData = require("./original/calendar_events_1.json");
  if (Array.isArray(originalData) && originalData.length > 0) {
    fallbackEvents = originalData as CalendarEvent[];
  }
} catch {
  // Use EVENTS_DATASET as fallback
}

let eventsCache: CalendarEvent[] = [];

/**
 * Initialize events from server (when V2 is enabled) or local JSON (fallback).
 * When V2 is enabled, fetches from /datasets/load endpoint based on seed.
 */
export async function initializeEvents(seedOverride?: number | null): Promise<CalendarEvent[]> {
  const seed = clampBaseSeed(seedOverride ?? getBaseSeedFromUrl());

  // If V2 is enabled, fetch from server endpoint
  if (isDbLoadModeEnabled()) {
    try {
      console.log("[events-enhanced] V2 enabled, fetching events from server with seed:", seed);
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
      } else {
        console.warn("[events-enhanced] Server returned empty array, falling back to local data");
      }
    } catch (error) {
      console.error("[events-enhanced] Failed to fetch from server, falling back to local data:", error);
      // Fall through to local fallback
    }
  }

  // Fallback to local JSON data (when V2 is disabled or server fetch failed)
  console.log("[events-enhanced] Using local fallback data");
  eventsCache = (fallbackEvents as CalendarEvent[]).map((e) => ({ ...e }));
  return eventsCache;
}
