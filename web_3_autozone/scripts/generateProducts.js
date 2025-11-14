#!/usr/bin/env node

/**
 * Generate additional product entries in the same format used by products-enhanced.ts
 * Usage:
 *   node scripts/generateProducts.js --count=50
 *
 * The script reads the existing src/data/products.json file, generates the requested
 * number of new products, skips any duplicates (by id or title), and appends the
 * new entries to the JSON file.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_COUNT = 50;
const PROJECT_ROOT = path.resolve(__dirname, ".." );
const DATA_PATH = path.resolve(PROJECT_ROOT, "src/data/products.json");

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

const categoryConfigs = {
  Kitchen: {
    image: "/images/homepage_categories/cookware.jpg",
    priceRange: [20, 180],
    brands: ["EdgeRenew", "BlendWave", "ChefWave", "BakeCraft", "HeatPulse", "SpiceMates"],
    nouns: [
      "Knife Sharpener",
      "Food Storage Set",
      "Sous Vide Circulator",
      "Digital Thermometer",
      "Coffee Grinder",
      "Immersion Blender",
      "Air Fryer Oven",
      "Pressure Cooker",
      "Herb Keeper",
      "Cast Iron Skillet"
    ],
    features: [
      "stainless steel construction",
      "programmable presets",
      "dishwasher safe parts",
      "non-slip silicone base",
      "smart temperature control",
      "integrated safety lock",
      "compact countertop design",
      "detachable accessories",
      "dual-zone heating"
    ]
  },
  Electronics: {
    image: "/images/homepage_categories/smart_tv.jpg",
    priceRange: [40, 600],
    brands: ["VoltGo", "SenseLink", "BrightCharge", "SecureEye", "Memoria", "SyncWave"],
    nouns: [
      "Wireless Charger",
      "Portable Projector",
      "Noise Cancelling Headphones",
      "Smart Doorbell",
      "Home Sensor Kit",
      "Portable Speaker",
      "Dash Camera",
      "Smart Plug Set",
      "Mini Drone",
      "USB-C Hub"
    ],
    features: [
      "Bluetooth 5.3 connectivity",
      "voice assistant compatibility",
      "low latency streaming",
      "HDR ready display",
      "USB-C fast charging",
      "multi-device pairing",
      "noise reduction technology",
      "compact travel design",
      "long-life rechargeable battery"
    ]
  },
  Home: {
    image: "/images/homepage_categories/sofa.jpg",
    priceRange: [25, 400],
    brands: ["GlowStand", "StoreEase", "AuraGlow", "DryFold", "CozyLoom", "ShelfCraft"],
    nouns: [
      "Accent Lamp",
      "Storage Ottoman",
      "Decor Throw",
      "Laundry Sorter",
      "Weighted Blanket",
      "Decorative Shelf Set",
      "Fabric Storage Cube",
      "Smart Diffuser",
      "Floor Cushion",
      "Area Rug"
    ],
    features: [
      "space-saving design",
      "premium upholstery",
      "breathable fabric cover",
      "modular configuration",
      "soft touch finish",
      "integrated cable management",
      "tool-free assembly",
      "removable washable cover",
      "ambient lighting mode"
    ]
  },
  Fitness: {
    image: "/images/homepage_categories/foam_roller.jpg",
    priceRange: [18, 260],
    brands: ["FlexFit", "PulseRope", "CoreRoll", "PowerVest", "TrailHydro", "RecoveryLab"],
    nouns: [
      "Adjustable Dumbbell",
      "Resistance Trainer",
      "Yoga Kit",
      "Hydration Backpack",
      "Massage Roller",
      "Weighted Jump Rope",
      "Doorway Pull-Up Bar",
      "Fitness Tracker",
      "Exercise Dice Set",
      "Balance Board"
    ],
    features: [
      "ergonomic grip",
      "sweat resistant materials",
      "adjustable resistance",
      "auto shut-off safety",
      "lightweight portable build",
      "quick-lock mechanism",
      "premium foam padding",
      "compact home gym design",
      "digital performance monitor"
    ]
  },
  Technology: {
    image: "/images/homepage_categories/vr.jpg",
    priceRange: [35, 550],
    brands: ["AudioCraft", "DeskCharge", "DockLift", "StreamBackdrop", "NoteSync", "WireTidy"],
    nouns: [
      "USB Microphone",
      "Portable SSD",
      "Wireless Presenter",
      "Smart Label Printer",
      "Laptop Dock",
      "Smart Notebook",
      "Charging Desk Pad",
      "Cable Organizer Kit",
      "Desk Hub",
      "Conference Speaker"
    ],
    features: [
      "sleek anodized finish",
      "hot-swappable components",
      "multi-platform support",
      "AI-assisted controls",
      "plug-and-play setup",
      "aluminum heat dissipation",
      "integrated RGB lighting",
      "wide compatibility",
      "low power consumption"
    ]
  }
};

const adjectives = [
  "Advanced",
  "Premium",
  "Smart",
  "Compact",
  "Eco",
  "Ultra",
  "Pro",
  "Elite",
  "Deluxe",
  "Signature",
  "Hybrid",
  "Dynamic",
  "Precision",
  "Modern"
];

function loadExistingProducts() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Products file not found at ${DATA_PATH}`);
  }
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function slugifyCategory(category) {
  return category.toLowerCase();
}

function collectIndices(products) {
  const indices = {};
  for (const product of products) {
    const category = product.category || "Misc";
    const slug = slugifyCategory(category).replace(/[^a-z]+/g, "-");
    const id = product.id || "";
    const match = id.match(new RegExp(`^${slug}-v2-(\\d+)$`, "i"));
    if (match) {
      const number = Number.parseInt(match[1], 10);
      if (!Number.isNaN(number)) {
        indices[slug] = Math.max(indices[slug] || 0, number);
      }
    }
  }
  return indices;
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomPrice([min, max]) {
  const value = min + Math.random() * (max - min);
  return `$${value.toFixed(2)}`;
}

function randomRating() {
  const rating = 4 + Math.random() * 0.9;
  return Number(rating.toFixed(1));
}

function buildDescription(features) {
  const selected = new Set();
  while (selected.size < 3) {
    selected.add(randomFrom(features));
  }
  return `Features ${Array.from(selected).join(", ")}.`;
}

function generateTitle(baseTitleSet, categoryConfig) {
  let attempt = 0;
  while (attempt < 10) {
    const title = `${randomFrom(adjectives)} ${randomFrom(categoryConfig.nouns)}`;
    if (!baseTitleSet.has(title.toLowerCase())) {
      return title;
    }
    attempt += 1;
  }
  // Fallback with random suffix
  return `${randomFrom(adjectives)} ${randomFrom(categoryConfig.nouns)} ${Math.floor(Math.random() * 900 + 100)}`;
}

function generateProducts(existingProducts, count) {
  const existingIds = new Set(existingProducts.map((p) => (p.id || "").toLowerCase()));
  const existingTitles = new Set(existingProducts.map((p) => (p.title || "").toLowerCase()));
  const categoryIndices = collectIndices(existingProducts);

  const categoryNames = Object.keys(categoryConfigs);
  const newProducts = [];
  let attempts = 0;

  while (newProducts.length < count && attempts < count * 20) {
    const category = categoryNames[newProducts.length % categoryNames.length];
    const config = categoryConfigs[category];
    const slug = slugifyCategory(category).replace(/[^a-z]+/g, "-");
    const nextIndex = (categoryIndices[slug] || 0) + 1;
    const id = `${slug}-v2-${nextIndex}`;

    categoryIndices[slug] = nextIndex;

    if (existingIds.has(id.toLowerCase())) {
      attempts += 1;
      continue;
    }

    const title = generateTitle(existingTitles, config);
    if (existingTitles.has(title.toLowerCase())) {
      attempts += 1;
      continue;
    }

    const product = {
      id,
      title,
      price: randomPrice(config.priceRange),
      image: config.image,
      description: buildDescription(config.features),
      category,
      rating: randomRating(),
      brand: randomFrom(config.brands),
      inStock: Math.random() > 0.1
    };

    existingIds.add(id.toLowerCase());
    existingTitles.add(title.toLowerCase());
    newProducts.push(product);
    attempts += 1;
  }

  return newProducts;
}

function main() {
  const products = loadExistingProducts();
  const newEntries = generateProducts(products, count);

  if (newEntries.length === 0) {
    console.warn("No new products were generated. Try increasing the vocabulary or count.");
    return;
  }

  const updated = [...products, ...newEntries];
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  console.log(`Added ${newEntries.length} new products to ${DATA_PATH}`);
}

main();
