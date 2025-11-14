#!/usr/bin/env node

/**
 * Generate additional restaurant entries in the same format used by dataset.ts
 * Usage:
 *   node scripts/generateRestaurants.js --count=50
 *
 * The script reads the existing src/data/restaurants.json file, generates the requested
 * number of new restaurants, skips any duplicates (by id or namepool), and appends the
 * new entries to the JSON file.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.resolve(PROJECT_ROOT, "src/data/restaurants.json");

const args = process.argv.slice(2);
const countArg = args.find((arg) => arg.startsWith("--count"));
let count = DEFAULT_COUNT;
if (countArg) {
  const [, value] = countArg.split("=");
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isNaN(parsed) && parsed > 0) {
    count = parsed;
  }
}

const countries = [
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "BD", name: "Bangladesh" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "EG", name: "Egypt" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" },
  { code: "NG", name: "Nigeria" },
  { code: "NL", name: "Netherlands" },
  { code: "PK", name: "Pakistan" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
];

const cuisines = [
  "French",
  "Italian",
  "American",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "Café",
  "Mediterranean",
  "Chinese",
  "Korean",
  "Vietnamese",
  "Spanish",
  "Greek",
  "Turkish",
  "Lebanese",
  "Brazilian",
  "Fusion",
  "Seafood",
  "Steakhouse",
];

const areas = [
  "Mission District",
  "SOMA",
  "North Beach",
  "Downtown",
  "Hayes Valley",
  "Nob Hill",
  "Japantown",
  "Embarcadero",
  "Marina",
  "Financial District",
  "Castro",
  "Pacific Heights",
  "Russian Hill",
  "Chinatown",
  "SoMa",
  "Mission Bay",
  "Potrero Hill",
  "Sunset",
  "Richmond",
  "Haight-Ashbury",
];

const namePrefixes = [
  "The",
  "Le",
  "La",
  "El",
  "Il",
  "Café",
  "Bistro",
  "Restaurant",
  "Grill",
  "Kitchen",
  "House",
  "Table",
  "Place",
  "Corner",
  "Garden",
  "Lounge",
  "Inn",
  "Tavern",
  "Pub",
  "Bar",
];

const nameSuffixes = [
  "Royal",
  "Vintage",
  "Evening",
  "River",
  "Fancy",
  "Urban",
  "Tandoori",
  "Zen",
  "Bella",
  "Coastal",
  "Harvest",
  "Crimson",
  "Golden",
  "Hungry",
  "Ocean",
  "Fire",
  "Olive",
  "Sunset",
  "Noir",
  "Blue",
  "Saffron",
  "Rustic",
  "Amber",
  "Lumière",
  "Maple",
  "Oak",
  "Peppercorn",
  "Local",
  "Cedar",
  "Soleil",
  "Brickhouse",
  "Wanderlust",
  "Nest",
  "Verona",
  "Midtown",
  "Ginger",
  "Lavender",
  "Hearthstone",
  "Juniper",
  "Garden",
  "Twilight",
  "Meadow",
  "Vine",
  "Ember",
  "Miso",
  "Borough",
  "Copper",
  "Pine",
  "Poppy",
  "Crimson",
];

const nameNouns = [
  "Dine",
  "Bites",
  "Delight",
  "Café",
  "Bistro",
  "Palate",
  "House",
  "Sushi",
  "Toro",
  "Vita",
  "Catch",
  "Table",
  "Spoon",
  "Lotus",
  "Fork",
  "Plate",
  "Spice",
  "Vine",
  "Cucina",
  "Grill",
  "Brasserie",
  "Orchid",
  "Garden",
  "Roots",
  "Lounge",
  "Hearth",
  "Flame",
  "Modern",
  "Kitchen",
  "Tapas",
  "Moor",
  "Grove",
  "Eats",
];

const prices = ["$", "$$", "$$$", "$$$$"];

function loadExistingRestaurants() {
  if (!fs.existsSync(DATA_PATH)) {
    return [];
  }
  try {
    const content = fs.readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading ${DATA_PATH}:`, err.message);
    return [];
  }
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRestaurantName(existingNames) {
  let attempt = 0;
  while (attempt < 50) {
    const prefix = Math.random() > 0.5 ? randomFrom(namePrefixes) + " " : "";
    const suffix = randomFrom(nameSuffixes);
    const noun = randomFrom(nameNouns);
    const name = `${prefix}${suffix} ${noun}`.trim();
    
    if (!existingNames.has(name.toLowerCase())) {
      return name;
    }
    attempt += 1;
  }
  // Fallback with random number
  const prefix = Math.random() > 0.5 ? randomFrom(namePrefixes) + " " : "";
  const suffix = randomFrom(nameSuffixes);
  const noun = randomFrom(nameNouns);
  return `${prefix}${suffix} ${noun} ${randomInt(100, 999)}`.trim();
}

function generateRestaurants(existingRestaurants, count) {
  const existingIds = new Set(existingRestaurants.map((r) => (r.id || "").toLowerCase()));
  const existingNames = new Set(
    existingRestaurants.map((r) => (r.namepool || "").toLowerCase())
  );

  const newRestaurants = [];
  let attempts = 0;
  let nextId = existingRestaurants.length > 0 
    ? Math.max(...existingRestaurants.map(r => Number.parseInt(r.id || "0", 10))) + 1
    : 1;

  while (newRestaurants.length < count && attempts < count * 20) {
    const id = String(nextId);
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const namepool = generateRestaurantName(existingNames);
    if (existingNames.has(namepool.toLowerCase())) {
      attempts += 1;
      continue;
    }

    const restaurant = {
      id,
      country: randomFrom(countries),
      namepool,
      cuisine: randomFrom(cuisines),
      area: randomFrom(areas),
      staticReviews: randomInt(10, 150),
      staticBookings: randomInt(5, 120),
      staticStars: randomInt(3, 5),
      staticPrices: randomFrom(prices),
    };

    existingIds.add(id.toLowerCase());
    existingNames.add(namepool.toLowerCase());
    newRestaurants.push(restaurant);
    nextId += 1;
    attempts += 1;
  }

  return newRestaurants;
}

function main() {
  const restaurants = loadExistingRestaurants();
  const newEntries = generateRestaurants(restaurants, count);

  if (newEntries.length === 0) {
    console.warn("No new restaurants were generated. Try increasing the vocabulary or count.");
    return;
  }

  const updated = [...restaurants, ...newEntries];
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new restaurants to ${DATA_PATH}`);
}

main();

