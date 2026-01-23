import { fetchSeededSelection, isDbLoadModeEnabled, getApiBaseUrl } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import fallbackTripsData from "./original/trips_1.json";

const PROJECT_KEY = "web_13_autodrive";
const ENTITY_TYPE = "trips";

// Trip type for extensibility
export interface Trip {
  id: string;
  status: "upcoming" | "completed" | "cancelled";
  ride: RideType;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: number;
  payment: string;
  driver: DriverType;
}

// Driver type for extensibility
export interface DriverType {
  name: string;
  car: string;
  plate: string;
  phone: string;
  photo: string;
}

// Ride type for extensibility
export interface RideType {
  name: string;
  icon: string;
  image: string;
  price: number;
}

export const rides: RideType[] = [
  {
    name: "AutoDriverX",
    image: "/car1.png",
    icon: "https://ext.same-assets.com/407674263/3757967630.png",
    price: 26.6,
  },
  {
    name: "Comfort",
    image: "/car2.png",
    icon: "https://ext.same-assets.com/407674263/2600779409.svg",
    price: 31.5,
  },
  {
    name: "AutoDriverXL",
    image: "/car3.png",
    icon: "https://ext.same-assets.com/407674263/2882408466.svg",
    price: 27.37,
  },
];

export const simulatedTrips: Trip[] = [
  {
    id: "1",
    status: "upcoming",
    ride: rides[1],
    pickup: "100 Van Ness - 100 Van Ness Ave, San Francisco, CA 94102, USA",
    dropoff:
      "1030 Post Street Apartments - 1030 Post St #112, San Francisco, CA 94109, USA",
    date: "2025-07-18",
    time: "13:00",
    price: 31.5,
    payment: "card",
    driver: {
      name: "Carlos Mendez",
      car: "Toyota Camry 2022",
      plate: "ABC-123",
      phone: "+1-555-0101",
      photo: "https://randomuser.me/api/portraits/men/1.jpg",
    },
  },
  {
    id: "2",
    status: "completed",
    ride: rides[0],
    pickup: "SFO Airport - San Francisco International Airport, CA 94128, USA",
    dropoff: "Union Square - Union Square, San Francisco, CA 94108, USA",
    date: "2025-07-17",
    time: "14:30",
    price: 26.6,
    payment: "cash",
    driver: {
      name: "Sarah Johnson",
      car: "Honda Accord 2021",
      plate: "XYZ-789",
      phone: "+1-555-0102",
      photo: "https://randomuser.me/api/portraits/women/2.jpg",
    },
  },
  {
    id: "3",
    status: "cancelled",
    ride: rides[2],
    pickup: "Fisherman's Wharf - Pier 39, San Francisco, CA 94133, USA",
    dropoff: "Coit Tower - 1 Telegraph Hill Blvd, San Francisco, CA 94133, USA",
    date: "2025-07-16",
    time: "16:20",
    price: 27.37,
    payment: "card",
    driver: {
      name: "Ahmed Hassan",
      car: "BMW 5 Series 2023",
      plate: "DEF-456",
      phone: "+1-555-0103",
      photo: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  },
];

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

const STATUSES: Trip["status"][] = ["upcoming", "completed", "cancelled"];

const DRIVER_POOL: DriverType[] = [
  {
    name: "Carlos Mendez",
    car: "Toyota Camry 2022",
    plate: "ABC-123",
    phone: "+1-555-0101",
    photo: "https://randomuser.me/api/portraits/men/44.jpg",
  },
  {
    name: "Sarah Johnson",
    car: "Honda Accord 2021",
    plate: "XYZ-789",
    phone: "+1-555-0102",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Ahmed Hassan",
    car: "BMW 5 Series 2023",
    plate: "DEF-456",
    phone: "+1-555-0103",
    photo: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    name: "Maria Garcia",
    car: "Mercedes E-Class 2022",
    plate: "GHI-789",
    phone: "+1-555-0104",
    photo: "https://randomuser.me/api/portraits/women/32.jpg",
  },
];

const ADDRESS_POOL: string[] = [
  "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
  "100 Van Ness Ave, San Francisco, CA 94102, USA",
  "Pier 39, San Francisco, CA 94133, USA",
  "SFO Airport - San Francisco International Airport, CA 94128, USA",
  "Union Square - San Francisco, CA 94108, USA",
  "Golden Gate Park - San Francisco, CA 94122, USA",
  "Chase Center - 1 Warriors Way, San Francisco, CA 94158, USA",
  "Oracle Park - 24 Willie Mays Plaza, San Francisco, CA 94107, USA",
  "Coit Tower - 1 Telegraph Hill Blvd, San Francisco, CA 94133, USA",
  "Ferry Building - 1 Ferry Building, San Francisco, CA 94105, USA",
  "Palace of Fine Arts - 3601 Lyon St, San Francisco, CA 94123, USA",
  "Salesforce Tower - 415 Mission St, San Francisco, CA 94105, USA",
  "Mission Dolores Park - Dolores St, San Francisco, CA 94114, USA",
  "Twin Peaks - 501 Twin Peaks Blvd, San Francisco, CA 94114, USA",
  "Exploratorium - Pier 15, San Francisco, CA 94111, USA",
];

const PAYMENT_METHODS = ["card", "cash", "business", "wallet"];

const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

const pick = <T,>(rng: () => number, collection: T[]): T =>
  collection[Math.floor(rng() * collection.length)];

/**
 * Normalize trip from JSON data
 */
const normalizeTrip = (trip: any): Trip => ({
  id: trip.id || `trip-${Math.random().toString(36).slice(2, 9)}`,
  status: trip.status || "upcoming",
  ride: {
    name: trip.ride?.name || "AutoDriverX",
    icon: trip.ride?.icon || trip.ride?.image || "/car1.png",
    image: trip.ride?.image || "/car1.png",
    price: trip.ride?.price || 26.6,
  },
  pickup: trip.pickup || "",
  dropoff: trip.dropoff || "",
  date: trip.date || new Date().toISOString().split("T")[0],
  time: trip.time || "10:00",
  price: trip.price || trip.ride?.price || 26.6,
  payment: trip.payment || "card",
  driver: {
    name: trip.driver?.name || "Driver",
    car: trip.driver?.car || "Vehicle",
    plate: trip.driver?.plate || "ABC-123",
    phone: trip.driver?.phone || "+1-555-0101",
    photo: trip.driver?.photo || "https://i.pravatar.cc/150?img=1",
  },
});

function generateDeterministicTrips(seed: number, limit: number): Trip[] {
  const rng = seededRandom(seed || 1);
  return Array.from({ length: limit }).map((_, index) => {
    const pickup = pick(rng, ADDRESS_POOL);
    let dropoff = pick(rng, ADDRESS_POOL);
    if (dropoff === pickup) {
      dropoff = pick(rng, ADDRESS_POOL);
    }
    const driver = pick(rng, DRIVER_POOL);
    const ride = pick(rng, rides);
    const status = pick(rng, STATUSES);
    const date = new Date(Date.now() + rng() * 1000 * 60 * 60 * 24 * 30);
    const isoDate = date.toISOString();
    return {
      id: `seed-${seed}-${index}`,
      status,
      ride,
      pickup,
      dropoff,
      date: isoDate.split("T")[0],
      time: isoDate.split("T")[1]?.slice(0, 5) ?? "10:00",
      price: Number((ride.price * (0.8 + rng() * 0.4)).toFixed(2)),
      payment: pick(rng, PAYMENT_METHODS),
      driver,
    };
  });
}

/**
 * Fetch AI generated trips from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedTrips(count: number): Promise<Trip[]> {
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

    return generatedData as Trip[];
  } catch (error) {
    console.error("[autodrive] AI generation failed:", error);
    throw error;
  }
}

/**
 * Initialize trips data for Web13 with deterministic pools.
 * Priority: DB → AI → Fallback (deterministic)
 */
export async function initializeTrips(
  v2SeedValue?: number | null,
  limit: number = 30
): Promise<Trip[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autodrive] Base seed is 1, using original trips data (skipping DB/AI modes)");
    // Return normalized trips from JSON
    return (fallbackTripsData as any[]).map(normalizeTrip);
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

    try {
      const trips = await fetchSeededSelection<Trip>({
        projectKey: PROJECT_KEY,
        entityType: ENTITY_TYPE,
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "shuffle",
      });

      if (Array.isArray(trips) && trips.length > 0) {
        console.log(
          `[autodrive] Loaded ${trips.length} trips from dataset (seed=${effectiveSeed})`
        );
        return trips;
      }

      // If no trips returned from backend, fallback to original JSON data
      console.warn(`[autodrive] No trips returned from backend (seed=${effectiveSeed}), falling back to original data`);
    } catch (error) {
      // If backend fails, fallback to original JSON data
      console.warn("[autodrive] Backend unavailable, falling back to original data:", error);
    }
  }
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autodrive] AI generation mode enabled, generating trips...");
      const generatedTrips = await fetchAiGeneratedTrips(limit);
      
      if (Array.isArray(generatedTrips) && generatedTrips.length > 0) {
        console.log(`[autodrive] Generated ${generatedTrips.length} trips via AI`);
        return generatedTrips;
      }
      
      console.warn("[autodrive] No trips generated, falling back to original data");
    } catch (error) {
      // If AI generation fails, fallback to original JSON data
      console.warn("[autodrive] AI generation failed, falling back to original data:", error);
    }
  }
  // Priority 3: Fallback - use original JSON data
  else {
    console.log("[autodrive] V2 modes disabled, using original data");
  }

  // Fallback to original JSON data
  return (fallbackTripsData as any[]).map(normalizeTrip);
}
