import { fetchSeededSelection, isDbLoadModeEnabled, getApiBaseUrl } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import fallbackRidesData from "./original/rides_1.json";

const PROJECT_KEY = "web_13_autodrive";
const ENTITY_TYPE = "rides";

// Ride type for the search page
export interface Ride {
  id: string;
  name: string;
  image: string;
  icon: string;
  price: number;
  oldPrice: number;
  seats: number;
  eta: string;
  desc: string;
  recommended: boolean;
  waitTime?: string;
  perMile?: number;
  perMinute?: number;
  features?: string[];
}

// Normalize ride from JSON data
const normalizeRide = (ride: any): Ride => ({
  id: ride.id || `r-${Math.random().toString(36).slice(2, 9)}`,
  name: ride.name || "",
  image: ride.image || "/car1.png",
  icon: ride.icon || ride.image || "/car1.png",
  price: ride.price || 26.6,
  oldPrice: ride.oldPrice || ride.price * 1.2 || 32.0,
  seats: ride.seats || 4,
  eta: ride.eta || "2 min away",
  desc: ride.desc || "",
  recommended: ride.recommended || false,
  waitTime: ride.waitTime,
  perMile: ride.perMile,
  perMinute: ride.perMinute,
  features: ride.features,
});

// Fallback rides data from JSON
const fallbackRides: Ride[] = (fallbackRidesData as any[]).map(normalizeRide);

const clampSeed = (value: number, fallback: number = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as Window & { __autodriveV2Seed?: number | null }).__autodriveV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
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

const resolveSeed = (dbModeEnabled: boolean, v2SeedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    const resolvedSeeds = resolveSeedsSync(v2SeedValue);
    if (resolvedSeeds.v2 !== null) {
      return clampSeed(resolvedSeeds.v2);
    }
    return clampSeed(v2SeedValue);
  }
  
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    const resolvedSeeds = resolveSeedsSync(baseSeed);
    if (resolvedSeeds.v2 !== null) {
      return resolvedSeeds.v2;
    }
    return clampSeed(baseSeed);
  }
  
  if (typeof window !== "undefined") {
    const fromClient = getRuntimeV2Seed();
    if (typeof fromClient === "number") {
      return fromClient;
    }
  }
  
  return 1;
};

const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

function formatEta(minutesFromNow: number): string {
  const etaTime = new Date();
  etaTime.setMinutes(etaTime.getMinutes() + minutesFromNow);
  const timeString = etaTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${minutesFromNow} min away · ${timeString}`;
}

/**
 * Generate deterministic rides from templates (fallback)
 */
function generateDeterministicRides(seed: number): Ride[] {
  const rng = seededRandom(seed || 1);
  const recommendedIdx = Math.floor(rng() * fallbackRides.length);

  return fallbackRides.map((template, idx) => {
    const surgeMultiplier = 0.85 + rng() * 0.4; // 0.85 - 1.25
    const price = Number((template.price * surgeMultiplier).toFixed(2));
    const oldPrice = Number((price * (1.05 + rng() * 0.15)).toFixed(2));
    const minutesAway = 1 + Math.floor(rng() * 5);

    return {
      ...template,
      price,
      oldPrice,
      eta: formatEta(minutesAway),
      recommended: idx === recommendedIdx,
    };
  });
}

/**
 * Fetch AI generated rides from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedRides(count: number): Promise<Ride[]> {
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

    return generatedData as Ride[];
  } catch (error) {
    console.error("[autodrive] AI generation failed for rides:", error);
    throw error;
  }
}

/**
 * Initialize rides data for Web13.
 * Priority: DB → AI → Fallback (deterministic)
 */
export async function initializeRides(
  v2SeedValue?: number | null,
  limit: number = 10
): Promise<Ride[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autodrive] Base seed is 1, using original rides data (skipping DB/AI modes)");
    return generateDeterministicRides(1);
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

    try {
      const rides = await fetchSeededSelection<Ride>({
        projectKey: PROJECT_KEY,
        entityType: ENTITY_TYPE,
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "shuffle",
      });

      if (Array.isArray(rides) && rides.length > 0) {
        console.log(
          `[autodrive] Loaded ${rides.length} rides from dataset (seed=${effectiveSeed})`
        );
        // Ensure at least one is recommended
        const ridesWithRecommended = rides.map((ride, idx) => ({
          ...ride,
          recommended: idx === 0 || ride.recommended || false,
        }));
        return ridesWithRecommended;
      }

      // If no rides returned from backend, fallback to deterministic generation
      console.warn(`[autodrive] No rides returned from backend (seed=${effectiveSeed}), falling back to deterministic generation`);
    } catch (error) {
      // If backend fails, fallback to deterministic generation
      console.warn("[autodrive] Backend unavailable for rides, falling back to deterministic generation:", error);
    }
  }
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autodrive] AI generation mode enabled, generating rides...");
      const generatedRides = await fetchAiGeneratedRides(limit);
      
      if (Array.isArray(generatedRides) && generatedRides.length > 0) {
        console.log(`[autodrive] Generated ${generatedRides.length} rides via AI`);
        // Ensure at least one is recommended
        const ridesWithRecommended = generatedRides.map((ride, idx) => ({
          ...ride,
          recommended: idx === 0 || ride.recommended || false,
        }));
        return ridesWithRecommended;
      }
      
      console.warn("[autodrive] No rides generated, falling back to deterministic generation");
    } catch (error) {
      // If AI generation fails, fallback to deterministic generation
      console.warn("[autodrive] AI generation failed for rides, falling back to deterministic generation:", error);
    }
  }
  // Priority 3: Fallback - use deterministic generation
  else {
    console.log("[autodrive] V2 modes disabled for rides, using deterministic generation");
  }

  // Fallback to deterministic generation
  const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);
  return generateDeterministicRides(effectiveSeed);
}
