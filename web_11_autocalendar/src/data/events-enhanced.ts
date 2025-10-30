import { isDataGenerationEnabled, generateProjectData } from "@/shared/data-generator";
import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import { EVENTS_DATASET, CalendarEvent } from "@/library/dataset";

/**
 * Initialize events data - prefers DB, then AI generation, then static dataset
 */
export async function initializeEvents(): Promise<CalendarEvent[]> {
  // If DB mode is enabled and we're in the browser, try loading from DB
  if (isDbLoadModeEnabled() && typeof window !== "undefined") {
    try {
      const dbData = await fetchSeededSelection<CalendarEvent>({
        projectKey: "web_11_autocalendar",
        entityType: "calendar_events",
        seedValue: 1,
        limit: 200
      });
      if (dbData && dbData.length > 0) {
        return dbData;
      }
    } catch {
      // Fall through to next strategy
    }
  }

  // If server-side while DB mode is enabled, just return static dataset
  if (isDbLoadModeEnabled() && typeof window === "undefined") {
    return EVENTS_DATASET as CalendarEvent[];
  }

  // If generation is disabled, return static dataset
  if (!isDataGenerationEnabled()) {
    return EVENTS_DATASET as CalendarEvent[];
  }

  // Check local cache first
  const cacheKey = "autocal_generated_events_v1";
  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as CalendarEvent[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // ignore and regenerate
    }
  }

  // Generate via backend
  try {
    const result = await generateProjectData("web_11_autocalendar", 120);
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
      }
      return result.data as CalendarEvent[];
    }
  } catch {
    // ignore and fall back
  }

  // Fallback
  return EVENTS_DATASET as CalendarEvent[];
}

export function clearEventsCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autocal_generated_events_v1");
  }
}


