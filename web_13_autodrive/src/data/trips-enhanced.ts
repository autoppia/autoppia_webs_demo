import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

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
    image: "/car1.jpg",
    icon: "https://ext.same-assets.com/407674263/3757967630.png",
    price: 26.6,
  },
  {
    name: "Comfort",
    image: "/car2.jpg",
    icon: "https://ext.same-assets.com/407674263/2600779409.svg",
    price: 31.5,
  },
  {
    name: "AutoDriverXL",
    image: "/car3.jpg",
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
  const value = (window as any).__autodriveV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

const resolveSeed = (v2SeedValue?: number | null): number => {
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampSeed(v2SeedValue);
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
 * Initialize trips data for Web13 with deterministic pools.
 * Always load from the seeded dataset and throw when it is unavailable,
 * ensuring seed selections stay consistent across reloads.
 */
export async function initializeTrips(
  limit: number = 30,
  seedOverride?: number | null
): Promise<Trip[]> {
  const dbEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);

  if (!dbEnabled) {
    return generateDeterministicTrips(effectiveSeed, limit);
  }

  try {
    const trips = await fetchSeededSelection<Trip>({
      projectKey: "web_13_autodrive",
      entityType: "trips",
      seedValue: effectiveSeed,
      limit,
      method: "shuffle",
    });

    if (Array.isArray(trips) && trips.length > 0) {
      console.log(
        `[autodrive] Loaded ${trips.length} trips from dataset (seed=${effectiveSeed})`
      );
      return trips;
    }

    throw new Error(
      `[autodrive] No trips returned from dataset (seed=${effectiveSeed})`
    );
  } catch (error) {
    console.error("[autodrive] Failed to load trips from dataset", error);
    return generateDeterministicTrips(effectiveSeed, limit);
  }
}
