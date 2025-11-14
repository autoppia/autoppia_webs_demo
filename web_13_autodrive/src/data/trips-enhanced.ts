import { generateWeb13Trips, isDataGenerationEnabled } from "@/shared/data-generator";
import { isDbLoadModeEnabled, fetchSeededSelection, getSeedValueFromEnv } from "@/shared/seeded-loader";
import { simulatedTrips, Trip } from "@/library/dataset";

/**
 * Initialize trips data for Web13 (client-side first design)
 * Priority:
 * 1) If DB mode enabled (and in browser): load seeded selection from backend
 * 2) If cached in localStorage: use cache
 * 3) If data-generation enabled: call /datasets/generate via shared generator (with local fallback)
 * 4) Fallback: static simulatedTrips from dataset
 */
export async function initializeTrips(limit: number = 30): Promise<Trip[]> {
  // Ensure this runs only on client for cache/localStorage usage
  const isBrowser = typeof window !== "undefined";
  console.log('[web13][trips-enhanced] initializeTrips()', { limit, isBrowser });

  // 1) DB Mode: load from backend using seeded-loader (client only)
  if (isDbLoadModeEnabled() && isBrowser) {
    console.log('[web13][trips-enhanced] DB mode enabled, attempting seeded load...');
    try {
      const dbData = await fetchSeededSelection<Trip>({
        projectKey: "web_13_autodrive",
        entityType: "trips",
        seedValue: getSeedValueFromEnv(1),
        limit,
        method: "select",
      });
      if (dbData && dbData.length > 0) {
        console.log('[web13][trips-enhanced] Loaded trips from DB', dbData.length);
        return dbData;
      }
    } catch {
      console.warn('[web13][trips-enhanced] DB load failed, will try cache/gen/fallback');
      // ignore and continue to next fallback
    }
  }

  // 2) Cache: seed-agnostic caching so data does NOT depend on seed value
  //    Use a single cache key regardless of URL seed; support optional forceRefresh param
  const cacheKey = "autodrive_generated_trips_v1";
  if (isBrowser) {
    const url = new URL(window.location.href);
    const forceRefresh = url.searchParams.get('forceRefresh') === '1';
    if (!forceRefresh) {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        try {
          const parsed: Trip[] = JSON.parse(cachedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('[web13][trips-enhanced] Using cached trips (seed-agnostic)', parsed.length);
            return parsed.slice(0, limit);
          }
        } catch {
          console.warn('[web13][trips-enhanced] Failed to parse cached trips, regenerating');
        }
      }
    } else {
      console.log('[web13][trips-enhanced] forceRefresh=1 detected, bypassing cache');
    }
  }

  // 2) Generation: via shared generator (falls back to local simulated if API fails or disabled)
  try {
    const result = await generateWeb13Trips(limit);
    const data = (result?.data as Trip[]) || [];
    if (Array.isArray(data) && data.length > 0) {
      console.log('[web13][trips-enhanced] Generated trips (AI or local fallback)', data.length, { success: result?.success, error: result?.error });
      if (isBrowser) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log('[web13][trips-enhanced] Cached trips (seed-agnostic)');
      }
    }
    if (data.length > 0) return data;
  } catch {
    console.error('[web13][trips-enhanced] Generation threw, using static fallback');
    // continue to static fallback
  }

  // 4) Fallback: static simulated dataset bundled with the app
  console.log('[web13][trips-enhanced] Using static simulatedTrips fallback', simulatedTrips.length);
  return simulatedTrips.slice(0, limit);
}

export function clearTripsCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autodrive_generated_trips_v1");
  }
}


