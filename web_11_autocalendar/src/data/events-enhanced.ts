import { clampBaseSeed } from "@/shared/seed-resolver";
import { CalendarEvent, EVENTS_DATASET } from "@/library/dataset";

let eventsCache: CalendarEvent[] = [];

/**
 * Initialize events from base seed data (local only).
 */
export async function initializeEvents(seedOverride?: number | null): Promise<CalendarEvent[]> {
  const _seed = clampBaseSeed(seedOverride ?? 1);
  eventsCache = EVENTS_DATASET.map((e) => ({ ...e }));
  return eventsCache;
}
