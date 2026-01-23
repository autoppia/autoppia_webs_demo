import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { getApiBaseUrl } from "@/shared/data-generator";
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

/**
 * Fetch AI generated events from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedEvents(count: number): Promise<CalendarEvent[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_key: PROJECT_KEY,
        entity_type: ENTITY_TYPE,
        count: 50, // Fixed count of 50
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI generation request failed: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    const result = await response.json();
    const generatedData = result?.generated_data ?? [];
    
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      throw new Error("No data returned from AI generation endpoint");
    }

    return generatedData as CalendarEvent[];
  } catch (error) {
    console.error("[autocalendar] AI generation failed:", error);
    throw error;
  }
}

export async function initializeEvents(v2SeedValue?: number | null, limit = 200): Promise<CalendarEvent[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
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
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autocalendar] AI generation mode enabled, generating events...");
      const generatedEvents = await fetchAiGeneratedEvents(limit);
      
      if (Array.isArray(generatedEvents) && generatedEvents.length > 0) {
        console.log(`[autocalendar] Generated ${generatedEvents.length} events via AI`);
        return generatedEvents;
      }
      
      console.warn("[autocalendar] No events generated, falling back to local JSON");
    } catch (error) {
      // If AI generation fails, fallback to local JSON
      console.warn("[autocalendar] AI generation failed, falling back to local JSON:", error);
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autocalendar] V2 modes disabled, loading from local JSON");
  }

  // Fallback to local JSON
  return EVENTS_DATASET.map((e) => ({ ...e }));
}
