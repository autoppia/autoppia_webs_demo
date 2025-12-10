/**
 * Data generator for web13 (rides / drivers / trips)
 *
 * Usage:
 *   import { generateProjectData, isDataGenerationEnabled } from './data-generator-web13';
 *   if (isDataGenerationEnabled()) {
 *     const res = await generateProjectData('web_13_autodrive', 20);
 *   }
 */

export interface DataGenerationResponse {
  success: boolean;
  data: any[];
  count: number;
  generationTime: number;
  error?: string;
}

export interface ProjectDataConfig {
  projectName: string;
  dataType: string;
  interfaceDefinition: string;
  examples: any[];
  categories: string[];
  namingRules: Record<string, any>;
  additionalRequirements: string;
}

/* ---------- project-specific config for web13 ---------- */

export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {
  'web_13_autodrive': {
    projectName: 'AutoDrive — Rides & Trips (Web13)',
    dataType: 'trips',
    interfaceDefinition: `
export interface DriverType {
  name: string;
  car: string;
  plate: string;
  phone: string;
  photo: string;
}

export interface RideType {
  name: string;
  icon: string;
  image: string;
  price: number;
}

export interface Trip {
  id: string;
  status: "upcoming" | "completed" | "cancelled";
  ride: RideType;
  pickup: string;
  dropoff: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  price: number;
  payment: string;
  driver: DriverType;
}
    `,
    examples: [
      {
        id: "trip-1",
        status: "upcoming",
        ride: {
          name: "Comfort",
          icon: "https://ext.same-assets.com/407674263/2600779409.svg",
          image: "https://images.unsplash.com/photo-1542367597-49a5f39f3b1e?w=800&h=600&fit=crop&auto=format&q=60",
          price: 31.5
        },
        pickup: "1 Hotel San Francisco - 8 Mission St, San Francisco, CA 94105, USA",
        dropoff: "1000 Chestnut St, San Francisco, CA 94109, USA",
        date: "2025-07-18",
        time: "13:00",
        price: 31.5,
        payment: "Visa ••••1270",
        driver: {
          name: "Maria Chen",
          car: "Honda Accord (White)",
          plate: "XYZ 789",
          phone: "+1 647-555-5678",
          photo: "https://randomuser.me/api/portraits/women/44.jpg"
        }
      }
    ],
    categories: ["standard", "comfort", "xl", "electric"],
    namingRules: {
      id: "trip-{timestamp}-{rand}",
      driver_photo: "https://randomuser.me/api/portraits/{gender}/{index}.jpg",
      ride_image: "https://images.unsplash.com/photo-{unsplash_id}?w=800&h=600&fit=crop&auto=format&q=60"
    },
    additionalRequirements:
      "Generate realistic trip data (pickup/dropoff addresses, ISO date/time strings), use plausible driver names/phones, return images from reliable sources (randomuser.me for driver photos, images.unsplash.com for ride/car images) and avoid local file paths. Provide varied statuses and distribution: approx 50% completed, 35% upcoming, 15% cancelled. Price should be a realistic number (round to 2 decimals)."
  }
};

/* ---------- Helper utilities ---------- */

// Optional diversity hints for AI generation
const CITY_HINTS = [
  'San Francisco, USA', 'New York, USA', 'Toronto, Canada', 'Vancouver, Canada',
  'London, UK', 'Manchester, UK', 'Paris, France', 'Berlin, Germany', 'Munich, Germany',
  'Barcelona, Spain', 'Madrid, Spain', 'Rome, Italy', 'Milan, Italy', 'Amsterdam, Netherlands',
  'Copenhagen, Denmark', 'Stockholm, Sweden', 'Oslo, Norway', 'Helsinki, Finland',
  'Dubai, UAE', 'Singapore', 'Tokyo, Japan', 'Osaka, Japan', 'Seoul, South Korea',
  'Sydney, Australia', 'Melbourne, Australia', 'Auckland, New Zealand',
  'Mexico City, Mexico', 'Buenos Aires, Argentina', 'Santiago, Chile'
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoDateDaysFromToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function timeHHMM() {
  const h = randInt(6, 23);
  const m = pick([0, 0, 0, 15, 30, 45]);
  return `${pad(h)}:${pad(m)}`;
}

function randomPhone(countryCode = '+1') {
  const area = randInt(200, 999);
  const mid = randInt(200, 999);
  const last = randInt(1000, 9999);
  return `${countryCode} ${area}-${mid}-${last}`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/* Predefined ride types (reuse/extend as needed) */
const DEFAULT_RIDES = [
  {
    name: 'AutoDriverX',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a',
    icon: 'https://ext.same-assets.com/407674263/3757967630.png',
    priceBase: 18.5
  },
  {
    name: 'Comfort',
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023',
    icon: 'https://ext.same-assets.com/407674263/2600779409.svg',
    priceBase: 25.0
  },
  {
    name: 'AutoDriverXL',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
    icon: 'https://ext.same-assets.com/407674263/2882408466.svg',
    priceBase: 30.0
  },
  {
    name: 'Electric',
    image: 'https://images.unsplash.com/photo-1541447272626-5f5c1b6d9a7b',
    icon: 'https://ext.same-assets.com/407674263/999999999.svg',
    priceBase: 28.75
  }
];

/* A small set of realistic addresses (for variety) */
const SAMPLE_ADDRESSES = [
  '100 Van Ness Ave, San Francisco, CA 94102, USA',
  '1030 Post St #112, San Francisco, CA 94109, USA',
  '8 Mission St, San Francisco, CA 94105, USA',
  '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
  '1 Infinite Loop, Cupertino, CA 95014, USA',
  '221B Baker St, London NW1 6XE, UK',
  'Plaza de la Constitución, Mexico City, 06000, MX'
];

/* Some realistic driver name pieces */
const FIRST_NAMES = ['Alexei', 'Maria', 'Samir', 'Olivia', 'Liam', 'Noah', 'Aisha', 'Diego', 'Chen', 'Fatima'];
const LAST_NAMES = ['Ivanov', 'Chen', 'Patel', 'Garcia', 'Smith', 'Khan', 'Singh', 'Díaz', 'Johnson', 'Nguyen'];

/* ---------- Local simulated dataset (fallback) ---------- */

export function generateLocalSimulatedTrips(count = 10): any[] {
  const data: any[] = [];
  for (let i = 0; i < count; i++) {
    const rideDef = pick(DEFAULT_RIDES);
    const distanceKm = round2(Math.max(1, Math.random() * 25));
    const surge = Math.random() < 0.15 ? 1.25 : 1.0;
    const base = rideDef.priceBase;
    const price = round2((base * (0.8 + Math.random() * 1.6) + distanceKm * 0.9) * surge);

    // status distribution: 50% completed, 35% upcoming, 15% cancelled
    const r = Math.random();
    const status = r < 0.5 ? 'completed' : (r < 0.85 ? 'upcoming' : 'cancelled');

    const gender = Math.random() < 0.5 ? 'men' : 'women';
    const photoIndex = randInt(1, 90);

    const driverName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

    const trip = {
      id: `trip-${Date.now()}-${i}-${randInt(100, 999)}`,
      status,
      ride: {
        name: rideDef.name,
        icon: rideDef.icon,
        image: `${rideDef.image}?w=800&h=600&fit=crop&auto=format&q=60`,
        price
      },
      pickup: pick(SAMPLE_ADDRESSES),
      dropoff: pick(SAMPLE_ADDRESSES),
      date: isoDateDaysFromToday(randInt(-30, 30)), // dates within +/-30 days
      time: timeHHMM(),
      price,
      payment: pick(['Visa ••••1270', 'Mastercard ••••4432', 'Cash', 'Amex ••••9012']),
      driver: {
        name: driverName,
        car: `${pick(['Toyota Camry', 'Honda Accord', 'Tesla Model 3', 'Hyundai Elantra', 'Ford Focus'])} (${pick(['Blue', 'White', 'Black', 'Red'])})`,
        plate: `${String.fromCharCode(65 + randInt(0, 25))}${String.fromCharCode(65 + randInt(0, 25))} ${randInt(100, 999)}`,
        phone: randomPhone('+1'),
        photo: `https://randomuser.me/api/portraits/${gender}/${photoIndex}.jpg`
      }
    };

    data.push(trip);
  }
  return data;
}

/* ---------- Core generator (API + fallback) ---------- */

export async function generateProjectData(
  projectKey: string,
  count: number = 10,
  categories?: string[]
): Promise<DataGenerationResponse> {
  console.log('[web13][data-generator] generateProjectData called', { projectKey, count, hasCategories: !!categories });
  const config = PROJECT_CONFIGS[projectKey];
  if (!config) {
    console.warn('[web13][data-generator] Missing project config for', projectKey);
    return {
      success: false,
      data: [],
      count: 0,
      generationTime: 0,
      error: `Project configuration not found for: ${projectKey}`
    };
  }

  const startTime = Date.now();
  const clampCount = Math.max(1, Math.min(500, Math.floor(count)));

  // If no data generation allowed in env, return local simulated data immediately
  if (!isDataGenerationEnabled()) {
    console.log('[web13][data-generator] Data generation disabled via env, using local simulated data.');
    const localData = generateLocalSimulatedTrips(clampCount);
    const generationTime = (Date.now() - startTime) / 1000;
    return {
      success: true,
      data: localData,
      count: localData.length,
      generationTime
    };
  }

  try {
    const baseUrl = getApiBaseUrl();
    console.log('[web13][data-generator] Attempting AI generation via API', { baseUrl, clampCount });
    // Attach a unique request identifier to encourage non-cached generation server-side
    const request_id = `${projectKey}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    // Build a dynamic diversity hint so drivers and locations vary between runs
    const shuffledCities = [...CITY_HINTS].sort(() => Math.random() - 0.5).slice(0, 8);
    const diversityHint = `Use diverse pickup/dropoff locations across these cities (mix them randomly, do not repeat the same city pairs): ${shuffledCities.join(", ")}. Vary driver nationalities and names across locales.`;

    // Randomize categories order to encourage ride variety
    const categoriesPayload = (categories && categories.length > 0)
      ? categories
      : [...config.categories].sort(() => Math.random() - 0.5);

    const resp = await fetch(`${baseUrl}/datasets/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        interface_definition: config.interfaceDefinition,
        examples: config.examples,
        count: clampCount,
        categories: categoriesPayload,
        additional_requirements: `${config.additionalRequirements}\n\n${diversityHint}\n- Do NOT reuse the same pickup/dropoff addresses across items.\n- Use different street names and numbers per trip; mix cities.\n- Ensure at least 6 distinct drivers with varied names/nationalities.\n- Vary ride types and prices; include economy, comfort, xl, electric, business.\n- No two trips should have identical (pickup, dropoff).\nRANDOMIZATION_SALT=${request_id}`,
        naming_rules: config.namingRules,
        project_key: projectKey,
        entity_type: config.dataType,
        save_to_db: false,
        request_id
      })
    });

    if (!resp.ok) {
      console.warn('[web13][data-generator] API error, falling back to local data', resp.status, resp.statusText);
      // fallback to local data if server fails
      const fallback = generateLocalSimulatedTrips(clampCount);
      const generationTime = (Date.now() - startTime) / 1000;
      return {
        success: false,
        data: fallback,
        count: fallback.length,
        generationTime,
        error: `API request failed: ${resp.status} ${resp.statusText} — returned fallback local data`
      };
    }

    const result = await resp.json();
    console.log('[web13][data-generator] API response received', { keys: Object.keys(result || {}) });

    const generationTime = (Date.now() - startTime) / 1000;

    // If API returns generated_data (convention), use it — otherwise try a sensible fallback
    const generated = result.generated_data ?? result.data ?? [];
    if (!Array.isArray(generated) || generated.length === 0) {
      console.warn('[web13][data-generator] API returned empty data, using local fallback');
      const fallback = generateLocalSimulatedTrips(clampCount);
      return {
        success: true,
        data: fallback,
        count: fallback.length,
        generationTime,
        error: 'API returned no generated items; returned local fallback data'
      };
    }

    console.log('[web13][data-generator] Generated items', generated.length);
    return {
      success: true,
      data: generated,
      count: generated.length,
      generationTime
    };
  } catch (err) {
    console.error('[web13][data-generator] Generation try/catch error, using local fallback', err);
    const generationTime = (Date.now() - startTime) / 1000;
    // on network / runtime error, return local simulated dataset as fallback
    const fallback = generateLocalSimulatedTrips(clampCount);
    return {
      success: false,
      data: fallback,
      count: fallback.length,
      generationTime,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/* ---------- Env helpers ---------- */

export function isDataGenerationEnabled(): boolean {
  let enabled = false;
  if (typeof process !== 'undefined' && process.env) {
    const vals = [
      process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE,
      process.env.ENABLE_DYNAMIC_V2_AI_GENERATE,
    ].map(v => String(v || '').toLowerCase());
    // Enable if ANY of the flags is a truthy "true" value
    enabled = vals.some(v => v === 'true' || v === '1' || v === 'yes' || v === 'on');
  }
  try {
    console.log('[web13][data-generator] isDataGenerationEnabled check', {
      NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE: process.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE,
      ENABLE_DYNAMIC_V2_AI_GENERATE: process.env?.ENABLE_DYNAMIC_V2_AI_GENERATE,
      resolved: enabled
    });
  } catch {}
  return enabled;
}

export function getApiBaseUrl(): string {
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

/* ---------- Convenience wrapper for web13 ---------- */

export async function generateWeb13Trips(count = 10): Promise<DataGenerationResponse> {
  return generateProjectData('web_13_autodrive', count);
}
