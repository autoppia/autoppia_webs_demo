import { isDataGenerationEnabled, generateProjectData } from "@/shared/data-generator";
import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import { EVENTS_DATASET, CalendarEvent } from "@/library/dataset";

/**
 * Initialize events data - prefers DB, then AI generation, then static dataset
 */
export async function initializeEvents(): Promise<CalendarEvent[]> {
  console.log("[AutoCalendar] initializeEvents start");
  // If DB mode is enabled and we're in the browser, try loading from DB
  if (isDbLoadModeEnabled() && typeof window !== "undefined") {
    console.log("[AutoCalendar] DB mode enabled (client) → fetching from DB");
    try {
      const dbData = await fetchSeededSelection<CalendarEvent>({
        projectKey: "web_11_autocalendar",
        entityType: "calendar_events",
        seedValue: 1,
        limit: 200
      });
      if (dbData && dbData.length > 0) {
        console.log(`[AutoCalendar] Loaded ${dbData.length} events from DB`);
        return dbData;
      }
    } catch {
      console.warn("[AutoCalendar] DB load failed; falling back");
    }
  }

  // If server-side while DB mode is enabled, just return static dataset
  if (isDbLoadModeEnabled() && typeof window === "undefined") {
    console.log("[AutoCalendar] DB mode (server) → using static dataset");
    return EVENTS_DATASET as CalendarEvent[];
  }

  // If generation is disabled, return static dataset
  if (!isDataGenerationEnabled()) {
    console.log("[AutoCalendar] Data generation disabled → using static dataset");
    return EVENTS_DATASET as CalendarEvent[];
  }

  // Check local cache first
  const cacheKey = "autocal_generated_events_v1";
  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as CalendarEvent[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[AutoCalendar] Using cached generated events: ${parsed.length}`);
        return parsed;
      }
    } catch {
      // ignore and regenerate
    }
  }

  // Generate via backend
  try {
    console.log("[AutoCalendar] Generating events via backend …");
    const result = await generateProjectData("web_11_autocalendar", 120);
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      console.log(`[AutoCalendar] Generated ${result.data.length} events`);
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        console.log("[AutoCalendar] Cached generated events → autocal_generated_events_v1");
      }
      return result.data as CalendarEvent[];
    }
    console.warn("[AutoCalendar] Generation response unsuccessful → falling back", result.error);
  } catch (err) {
    console.error("[AutoCalendar] Generation error → falling back", err);
  }

  // Fallback
  console.log("[AutoCalendar] Using static dataset fallback");
  return EVENTS_DATASET as CalendarEvent[];
}

export function clearEventsCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autocal_generated_events_v1");
  }
}


