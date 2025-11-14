#!/usr/bin/env node

/**
 * Generate additional hotel entries in the same format used by dataset.ts
 * Usage:
 *   node scripts/generateHotels.js --count=50
 *
 * The script reads the existing src/data/hotels.json file, generates the requested
 * number of new hotels, skips any duplicates (by id), and appends the new entries
 * to the JSON file.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.resolve(PROJECT_ROOT, "src/data/hotels.json");

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

// Data pools
const hotelTitles = [
  "The Pinewood Chalet", "Sunset Beach Bungalow", "Alpine Retreat Lodge", "Riverside Zen Cottage",
  "Bohemian Loft", "Urban Oasis", "Mountain View Cabin", "Seaside Villa", "Desert Hideaway",
  "Forest Retreat", "City Penthouse", "Countryside Manor", "Lakeside Lodge", "Beachfront Condo",
  "Historic Mansion", "Modern Studio", "Cozy Cottage", "Luxury Suite", "Garden Apartment", "Skyline Loft"
];

const hotelSuffixes = [
  "Chalet", "Bungalow", "Lodge", "Cottage", "Loft", "Villa", "Cabin", "Retreat", "Hideaway",
  "Manor", "Suite", "Apartment", "Studio", "Penthouse", "House", "Residence", "Estate", "Palace"
];

const hotelPrefixes = [
  "The", "Sunset", "Alpine", "Riverside", "Bohemian", "Urban", "Mountain", "Seaside", "Desert",
  "Forest", "City", "Countryside", "Lakeside", "Beachfront", "Historic", "Modern", "Cozy", "Luxury",
  "Garden", "Skyline", "Golden", "Royal", "Premium", "Classic", "Traditional", "Contemporary"
];

const locations = [
  "Lake Tahoe, USA", "Goa, India", "Zermatt, Switzerland", "Kyoto, Japan", "Lisbon, Portugal",
  "Paris, France", "Bali, Indonesia", "Santorini, Greece", "Barcelona, Spain", "Tokyo, Japan",
  "New York, USA", "London, UK", "Sydney, Australia", "Dubai, UAE", "Rome, Italy",
  "Amsterdam, Netherlands", "Prague, Czech Republic", "Vienna, Austria", "Berlin, Germany", "Stockholm, Sweden",
  "Copenhagen, Denmark", "Oslo, Norway", "Reykjavik, Iceland", "Edinburgh, Scotland", "Dublin, Ireland",
  "Madrid, Spain", "Athens, Greece", "Istanbul, Turkey", "Moscow, Russia", "Warsaw, Poland",
  "Budapest, Hungary", "Krakow, Poland", "Florence, Italy", "Venice, Italy", "Naples, Italy",
  "Milan, Italy", "Zurich, Switzerland", "Geneva, Switzerland", "Lucerne, Switzerland", "Interlaken, Switzerland",
  "Munich, Germany", "Hamburg, Germany", "Frankfurt, Germany", "Cologne, Germany", "Dresden, Germany",
  "Brussels, Belgium", "Antwerp, Belgium", "Bruges, Belgium", "Ghent, Belgium", "Luxembourg, Luxembourg"
];

const firstNames = [
  "Emily", "Raj", "Luca", "Aiko", "Beatriz", "Sarah", "Michael", "Jessica", "David", "Maria",
  "James", "Anna", "Robert", "Emma", "William", "Olivia", "Richard", "Sophia", "Joseph", "Isabella",
  "Thomas", "Charlotte", "Charles", "Amelia", "Christopher", "Mia", "Daniel", "Harper", "Matthew", "Evelyn",
  "Anthony", "Abigail", "Mark", "Emily", "Donald", "Elizabeth", "Steven", "Sofia", "Paul", "Avery",
  "Andrew", "Ella", "Joshua", "Scarlett", "Kenneth", "Victoria", "Kevin", "Aria", "Brian", "Grace"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
  "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young"
];

const amenityTemplates = [
  {
    icon: "💻",
    titles: ["Dedicated workspace", "Work-friendly space", "Fast WiFi", "WiFi included", "High-speed internet"],
    descs: [
      "A common area with wifi that's well-suited for working.",
      "Large table and mountain views for productivity.",
      "Perfect for remote work or video calls.",
      "Reliable high-speed internet connection.",
      "Fast and stable connection for all your needs."
    ]
  },
  {
    icon: "📍",
    titles: ["Great location", "Prime beach access", "Ski-in, Ski-out", "Near Gion District", "Central Alfama", "City center"],
    descs: [
      "Close to hiking trails and the lake shore.",
      "Step out directly onto the sandy beach.",
      "Direct access to the Matterhorn slopes.",
      "Walking distance to temples and tea houses.",
      "Right in the heart of old Lisbon.",
      "Conveniently located near all major attractions."
    ]
  },
  {
    icon: "🔍",
    titles: ["Easy check-in", "Local guidebooks", "Luxury amenities", "Traditional style", "City views", "Self check-in"],
    descs: [
      "Guests loved the seamless self-check-in process.",
      "Explore nearby restaurants and attractions.",
      "Fireplace, spa tub, and heated floors included.",
      "Shoji doors, futon beds, and stone bath.",
      "Rooftop access with panoramic skyline.",
      "Keyless entry for your convenience."
    ]
  },
  {
    icon: "🏊",
    titles: ["Swimming pool", "Private pool", "Infinity pool", "Pool access"],
    descs: [
      "Relax in our beautiful swimming pool.",
      "Enjoy your own private pool area.",
      "Stunning infinity pool with ocean views.",
      "Access to shared pool facilities."
    ]
  },
  {
    icon: "🍳",
    titles: ["Full kitchen", "Kitchenette", "Coffee maker", "Breakfast included"],
    descs: [
      "Fully equipped kitchen for all your cooking needs.",
      "Compact kitchenette with essential appliances.",
      "Fresh coffee available every morning.",
      "Complimentary breakfast served daily."
    ]
  },
  {
    icon: "🚗",
    titles: ["Free parking", "Parking available", "Garage access"],
    descs: [
      "Free parking space included with your stay.",
      "Convenient parking available nearby.",
      "Private garage for your vehicle."
    ]
  }
];

function loadExistingHotels() {
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

function randomFloat(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(1));
}

function randomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(startDate.getTime() + randomTime);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateHotelTitle() {
  const usePrefix = Math.random() > 0.5;
  const useSuffix = Math.random() > 0.5;
  
  if (usePrefix && useSuffix) {
    const prefix = randomFrom(hotelPrefixes);
    const suffix = randomFrom(hotelSuffixes);
    return `${prefix} ${suffix}`;
  } else if (usePrefix) {
    const prefix = randomFrom(hotelPrefixes);
    const base = randomFrom(hotelTitles).split(" ").slice(1).join(" ") || randomFrom(hotelSuffixes);
    return `${prefix} ${base}`;
  } else {
    const base = randomFrom(hotelTitles);
    const variation = randomInt(1, 999);
    return `${base} ${variation}`;
  }
}

function generateAmenities() {
  const amenityCount = randomInt(3, 5);
  const selectedAmenities = [];
  const usedIcons = new Set();
  
  while (selectedAmenities.length < amenityCount) {
    const template = randomFrom(amenityTemplates);
    if (!usedIcons.has(template.icon)) {
      const title = randomFrom(template.titles);
      const desc = randomFrom(template.descs);
      selectedAmenities.push({
        icon: template.icon,
        title,
        desc
      });
      usedIcons.add(template.icon);
    } else if (selectedAmenities.length < amenityCount) {
      // Allow duplicate icons if we need more amenities
      const title = randomFrom(template.titles);
      const desc = randomFrom(template.descs);
      selectedAmenities.push({
        icon: template.icon,
        title,
        desc
      });
    }
  }
  
  return selectedAmenities;
}

function generateHotels(existingHotels, count) {
  const existingIds = new Set(existingHotels.map((h) => h.id));
  const existingTitles = new Set(existingHotels.map((h) => (h.title || "").toLowerCase()));

  const newHotels = [];
  let attempts = 0;
  let nextId = existingHotels.length > 0
    ? Math.max(...existingHotels.map(h => h.id || 0)) + 1
    : 1;

  while (newHotels.length < count && attempts < count * 20) {
    if (existingIds.has(nextId)) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    let title = generateHotelTitle();
    let titleAttempt = 0;
    while (existingTitles.has(title.toLowerCase()) && titleAttempt < 10) {
      title = generateHotelTitle();
      titleAttempt += 1;
    }
    if (existingTitles.has(title.toLowerCase())) {
      title = `${title} ${randomInt(100, 999)}`;
    }

    const location = randomFrom(locations);
    const rating = randomFloat(4.0, 5.0);
    const reviews = randomInt(50, 500);
    
    const maxGuests = randomInt(1, 8);
    const guests = maxGuests;
    const bedrooms = Math.max(1, Math.floor(maxGuests / 2));
    const beds = Math.max(1, bedrooms);
    const baths = Math.max(1, Math.floor(bedrooms / 2) + 1);
    
    const datesFrom = formatDate(randomDate(new Date("2025-01-01"), new Date("2025-06-30")));
    const datesTo = formatDate(randomDate(new Date(datesFrom), new Date("2025-12-31")));
    
    const price = randomInt(50, 500);
    
    const hostName = randomFrom(firstNames);
    const hostSince = randomInt(1, 10);
    const hostGender = Math.random() > 0.5 ? "men" : "women";
    const hostAvatar = `https://randomuser.me/api/portraits/${hostGender}/${randomInt(1, 99)}.jpg`;
    
    const imageNum = randomInt(1, 20);
    const imageExt = Math.random() > 0.5 ? "jpeg" : "png";
    const image = `/images/hotel${imageNum}.${imageExt}`;
    
    const amenities = generateAmenities();

    const hotel = {
      id: nextId,
      image,
      title,
      location,
      rating: Number(rating.toFixed(1)),
      reviews,
      guests,
      maxGuests,
      bedrooms,
      beds,
      baths,
      datesFrom,
      datesTo,
      price,
      host: {
        name: hostName,
        since: hostSince,
        avatar: hostAvatar
      },
      amenities
    };

    existingIds.add(nextId);
    existingTitles.add(title.toLowerCase());
    newHotels.push(hotel);
    nextId += 1;
    attempts += 1;
  }

  return newHotels;
}

function main() {
  const hotels = loadExistingHotels();
  const newEntries = generateHotels(hotels, count);

  if (newEntries.length === 0) {
    console.warn("No new hotels were generated. Try increasing the vocabulary or count.");
    return;
  }

  const updated = [...hotels, ...newEntries];
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new hotels to ${DATA_PATH}`);
}

main();

