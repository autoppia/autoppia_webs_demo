import { isDbLoadModeEnabled, fetchSeededSelection, getSeedValueFromEnv } from "@/shared/seeded-loader";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import { Hotel } from "@/types/hotel";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";

// Import fallback data - check if original directory exists
let fallbackHotels: Hotel[] = DASHBOARD_HOTELS as Hotel[];
try {
  // Try to import original data if it exists
  const originalData = require("./original/hotels_1.json");
  if (Array.isArray(originalData) && originalData.length > 0) {
    fallbackHotels = originalData as Hotel[];
  }
} catch (e) {
  // If original data doesn't exist, use DASHBOARD_HOTELS as fallback
  console.log("[autolodge] Original data not found, using DASHBOARD_HOTELS as fallback");
}

/**
 * Get base seed from URL
 */
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

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autolodgeV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

const clampSeed = (seed: number): number => {
  if (Number.isNaN(seed)) return 1;
  if (seed < 1) return 1;
  if (seed > 300) return 300;
  return seed;
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

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const origin = typeof window !== "undefined" ? window.location?.origin : undefined;
  const envIsLocal = envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"));
  const originIsLocal = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"));

  if (envUrl && (!(envIsLocal) || originIsLocal)) {
    return envUrl;
  }
  if (origin) {
    return `${origin}/api`;
  }
  return envUrl || "http://app:8090";
}

/**
 * Fetch AI generated hotels from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedHotels(count: number): Promise<Hotel[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autolodge] fetchAiGeneratedHotels - URL:", url, "count:", count);
  
  try {
    console.log("[autolodge] Sending AI generation request...");
    const requestBody = {
      project_key: "web_8_autolodge",
      entity_type: "hotels",
      count: 50, // Fixed count of 50
    };
    console.log("[autolodge] Request body:", requestBody);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[autolodge] AI generation response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("[autolodge] AI generation request failed - Status:", response.status, "Error:", errorText);
      throw new Error(`AI generation request failed: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    console.log("[autolodge] Parsing AI generation response...");
    const result = await response.json();
    console.log("[autolodge] AI generation response keys:", Object.keys(result));
    
    const generatedData = result?.generated_data ?? [];
    console.log("[autolodge] Generated data length:", generatedData.length, "isArray:", Array.isArray(generatedData));
    
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autolodge] Invalid generated data:", generatedData);
      throw new Error("No data returned from AI generation endpoint");
    }

    console.log("[autolodge] Successfully fetched", generatedData.length, "hotels from AI generation");
    return generatedData as Hotel[];
  } catch (error) {
    console.error("[autolodge] AI generation failed with error:", error);
    if (error instanceof Error) {
      console.error("[autolodge] Error message:", error.message);
      console.error("[autolodge] Error stack:", error.stack);
    }
    throw error;
  }
}

// Dynamic hotels array
let dynamicHotels: Hotel[] = [];

/**
 * Initialize hotels with V2 system (DB mode, AI generation, or fallback)
 */
export async function initializeHotels(v2SeedValue?: number | null, baseSeedOverride?: number | null): Promise<Hotel[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autolodge] initializeHotels - dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled, "v2SeedValue:", v2SeedValue);
  
  // Get base seed - use override if provided, otherwise read from URL
  const baseSeed = baseSeedOverride !== undefined && baseSeedOverride !== null
    ? baseSeedOverride
    : getBaseSeedFromUrl(); // This now returns null if no seed in URL

  console.log("[autolodge] initializeHotels - seed check:", {
    baseSeed,
    v2SeedValue,
    dbModeEnabled,
    aiGenerateEnabled,
    shouldUseOriginal: baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)
  });

  // IMPORTANT: If baseSeed = 1 and V2 is enabled (DB mode or AI generation), use original data
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autolodge] Base seed is 1 and V2 enabled, using original data (skipping DB/AI modes)");
    dynamicHotels = (fallbackHotels as Hotel[]).map((h) => ({ ...h }));
    console.log("[autolodge] Loaded original hotels:", dynamicHotels.length);
    return dynamicHotels;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[autolodge] DB mode enabled, attempting to load from DB...");
    console.log("[autolodge] baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue);
    
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);
    console.log("[autolodge] Effective seed for DB load:", effectiveSeed);

    try {
      console.log("[autolodge] Calling fetchSeededSelection with:", {
        projectKey: "web_8_autolodge",
        entityType: "hotels",
        seedValue: effectiveSeed,
        limit: 50,
        method: "distribute",
        filterKey: "location",
      });
      
      const hotels = await fetchSeededSelection<Hotel>({
        projectKey: "web_8_autolodge",
        entityType: "hotels",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "distribute",
        filterKey: "location",
      });

      console.log("[autolodge] fetchSeededSelection returned:", hotels?.length, "hotels");
      console.log("[autolodge] First few hotels:", hotels?.slice(0, 3));

      if (Array.isArray(hotels) && hotels.length > 0) {
        console.log(
          `[autolodge] ✅ Successfully loaded ${hotels.length} hotels from dataset (seed=${effectiveSeed})`
        );
        dynamicHotels = hotels.map((h) => ({ ...h }));
        return dynamicHotels;
      }

      console.warn(`[autolodge] ⚠️ No hotels returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.error("[autolodge] ❌ Backend unavailable, falling back to local JSON. Error:", error);
      if (error instanceof Error) {
        console.error("[autolodge] Error message:", error.message);
        console.error("[autolodge] Error stack:", error.stack);
      }
    }
  }
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  // Only try AI generation if DB mode is not enabled (AI is fallback when DB is off)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      console.log("[autolodge] AI generation mode enabled, generating hotels...");
      const generatedHotels = await fetchAiGeneratedHotels(50);
      console.log("[autolodge] fetchAiGeneratedHotels returned:", generatedHotels?.length, "hotels");
      
      if (Array.isArray(generatedHotels) && generatedHotels.length > 0) {
        console.log(`[autolodge] ✅ Generated ${generatedHotels.length} hotels via AI`);
        dynamicHotels = generatedHotels.map((h) => ({ ...h }));
        console.log("[autolodge] Normalized hotels count:", dynamicHotels.length);
        return dynamicHotels;
      }
      
      console.warn("[autolodge] No hotels generated, falling back to local JSON. generatedHotels:", generatedHotels);
    } catch (error) {
      console.error("[autolodge] AI generation failed, falling back to local JSON. Error details:", error);
      if (error instanceof Error) {
        console.error("[autolodge] Error message:", error.message);
        console.error("[autolodge] Error stack:", error.stack);
      }
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autolodge] V2 modes disabled, loading from local JSON");
  }

  // Fallback to local JSON
  dynamicHotels = (fallbackHotels as Hotel[]).map((h) => ({ ...h }));
  return dynamicHotels;
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadHotelsFromDb(seedOverride?: number | null): Promise<Hotel[]> {
  if (!isDbLoadModeEnabled()) {
    console.log("[autolodge] loadHotelsFromDb: DB mode not enabled, returning empty array");
    return [];
  }
  
  // Check base seed from URL - if seed = 1, return empty array to trigger fallback
  const baseSeed = getBaseSeedFromUrl();
  const fallbackSeed = getSeedValueFromEnv(1);
  const seed = (typeof seedOverride === "number" && seedOverride > 0) ? seedOverride : fallbackSeed;
  
  console.log("[autolodge] loadHotelsFromDb - baseSeed:", baseSeed, "seedOverride:", seedOverride, "final seed:", seed);
  
  // If seed = 1, return empty array so initializeHotels will use fallback data
  if (baseSeed === 1 || seed === 1) {
    console.log("[autolodge] loadHotelsFromDb: seed is 1, returning empty array to use fallback data");
    return [];
  }
  
  try {
    const limit = 50; // Fixed limit of 50 items
    console.log("[autolodge] loadHotelsFromDb: Fetching from server with seed:", seed, "limit:", limit);
    // Prefer distributed selection to avoid location dominance
    const distributed = await fetchSeededSelection<Hotel>({
      projectKey: "web_8_autolodge",
      entityType: "hotels",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "location",
    });
    const selected = Array.isArray(distributed) && distributed.length > 0 ? distributed : await fetchSeededSelection<Hotel>({
      projectKey: "web_8_autolodge",
      entityType: "hotels",
      seedValue: seed,
      limit,
      method: "select",
    });
    if (selected && selected.length > 0) {
      console.log("[autolodge] loadHotelsFromDb: ✅ Successfully loaded", selected.length, "hotels from DB");
      return selected.map((h) => ({ ...h }));
    } else {
      console.warn("[autolodge] loadHotelsFromDb: ⚠️ No hotels selected from DB (selected length:", selected?.length, ")");
    }
  } catch (e) {
    console.error("[autolodge] loadHotelsFromDb: ❌ Failed to load seeded hotel selection from DB:", e);
    if (e instanceof Error) {
      console.error("[autolodge] Error message:", e.message);
      console.error("[autolodge] Error stack:", e.stack);
    }
  }
  
  console.log("[autolodge] loadHotelsFromDb: Returning empty array");
  return [];
}

/**
 * Clear cached hotel data
 */
export function clearHotelCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autolodge_generated_hotels_v1");
    console.log('🗑️ Cleared hotel cache');
  }
}

// Export the dynamic hotels array for direct access
export { dynamicHotels as hotels };
