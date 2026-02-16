import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

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

const resolveSeed = (v2SeedValue?: number | null): number => {
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampBaseSeed(v2SeedValue);
  }

  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== undefined) {
    return clampBaseSeed(baseSeed);
  }

  // Fallback to runtime seed if available
  if (typeof window !== "undefined") {
    const fromClient = getRuntimeV2Seed();
    if (typeof fromClient === "number") {
      return clampBaseSeed(fromClient);
    }
  }

  return 1;
};

/**
 * Initialize trips data from server endpoint.
 * Server determines whether v2 is enabled or disabled.
 * When v2 is disabled, the server returns the original dataset.
 */
export async function initializeTrips(
  v2SeedValue?: number | null,
  limit: number = 30
): Promise<Trip[]> {
  // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const effectiveSeed = resolveSeed(v2SeedValue);

  // Always call the server endpoint - server is the single source of truth
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
        `[autodrive] Loaded ${trips.length} trips from server (seed=${effectiveSeed})`
      );
      return trips;
    }

    // If server returns empty array, throw error (no fallback)
    throw new Error(`Server returned empty array for seed ${effectiveSeed}`);
  } catch (error) {
    console.error("[autodrive] Failed to load trips from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
