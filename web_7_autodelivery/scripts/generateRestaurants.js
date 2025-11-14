#!/usr/bin/env node

/**
 * Generate additional restaurant entries in the same format used by restaurants.ts
 * Usage:
 *   node scripts/generateRestaurants.js --count=50
 *
 * The script reads the existing src/data/restaurants.json file, generates the requested
 * number of new restaurants, skips any duplicates (by id), and appends the new entries
 * to the JSON file.
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

// Data pools
const restaurantNames = [
  "Pizza Palace", "Sushi World", "Curry House", "Taco Fiesta", "Burger Joint",
  "Green Bowl", "Dragon Wok", "Pasta Fresca", "Sweet Corner", "Pho Express",
  "Bagel Bros", "Falafel King", "Steakhouse Prime", "Ramen House", "Greek Taverna",
  "BBQ Pit", "Tapas Bar", "Bistro Belle", "Kebab Express", "Deli Central",
  "Tandoori Nights", "Poke Bowl Co.", "Waffle Works", "Souvlaki Stop", "Pho 88"
];

const cuisineTypes = [
  "Italian", "Japanese", "Indian", "Mexican", "American", "Vegan", "Chinese",
  "Desserts", "Vietnamese", "Breakfast", "Middle Eastern", "Steakhouse",
  "Greek", "Barbecue", "Spanish", "French", "Turkish", "Deli", "Hawaiian"
];

const restaurantSuffixes = [
  "Express", "House", "Palace", "Corner", "Kitchen", "Bistro", "Cafe", "Grill",
  "Bar", "Restaurant", "Diner", "Eatery", "Tavern", "Lounge", "Spot"
];

const restaurantPrefixes = [
  "The", "El", "La", "Le", "Golden", "Royal", "Premium", "Classic", "Modern",
  "Traditional", "Authentic", "Fresh", "Gourmet", "Artisan", "Signature"
];

const menuItemTypes = {
  Italian: ["Pizza", "Pasta", "Risotto", "Lasagna", "Ravioli", "Fettuccine", "Carbonara", "Margherita"],
  Japanese: ["Sushi", "Ramen", "Teriyaki", "Tempura", "Sashimi", "Miso Soup", "Gyoza", "Udon"],
  Indian: ["Curry", "Tikka Masala", "Biryani", "Naan", "Samosas", "Dal", "Paneer", "Tandoori"],
  Mexican: ["Taco", "Burrito", "Quesadilla", "Enchilada", "Nachos", "Guacamole", "Carnitas", "Fajitas"],
  American: ["Burger", "Fries", "Wings", "Sandwich", "Hot Dog", "Mac & Cheese", "BBQ", "Steak"],
  Vegan: ["Bowl", "Salad", "Wrap", "Smoothie", "Burrito", "Soup", "Quinoa", "Tofu"],
  Chinese: ["Lo Mein", "Fried Rice", "Dumplings", "Kung Pao", "Sweet & Sour", "General Tso's", "Mapo Tofu", "Orange Chicken"],
  Desserts: ["Cake", "Ice Cream", "Pie", "Tart", "Brownie", "Cookie", "Cheesecake", "Tiramisu"],
  Vietnamese: ["Pho", "Banh Mi", "Spring Rolls", "Bun Cha", "Banh Xeo", "Com Tam", "Bun Bo", "Goi Cuon"],
  Breakfast: ["Pancakes", "Waffles", "Omelet", "Bagel", "Toast", "Cereal", "Oatmeal", "Breakfast Sandwich"],
  "Middle Eastern": ["Falafel", "Shawarma", "Hummus", "Baba Ganoush", "Kebab", "Tabbouleh", "Pita", "Lamb"],
  Steakhouse: ["Ribeye", "Filet Mignon", "T-Bone", "Sirloin", "Prime Rib", "Wagyu", "Porterhouse", "New York Strip"],
  Greek: ["Gyro", "Souvlaki", "Spanakopita", "Moussaka", "Greek Salad", "Dolmades", "Tzatziki", "Baklava"],
  Barbecue: ["Ribs", "Brisket", "Pulled Pork", "BBQ Chicken", "Sausage", "Cornbread", "Coleslaw", "Baked Beans"],
  Spanish: ["Tapas", "Paella", "Gazpacho", "Chorizo", "Patatas Bravas", "Tortilla", "Jamón", "Croquetas"],
  French: ["Coq au Vin", "Ratatouille", "Bouillabaisse", "Cassoulet", "Onion Soup", "Duck Confit", "Escargot", "Crêpe"],
  Turkish: ["Kebab", "Doner", "Lahmacun", "Baklava", "Turkish Delight", "Pide", "Manti", "Borek"],
  Deli: ["Pastrami", "Reuben", "Corned Beef", "Matzo Ball Soup", "Lox", "Bagel", "Knish", "Latkes"],
  Hawaiian: ["Poke Bowl", "Loco Moco", "Kalua Pork", "Spam Musubi", "Huli Huli Chicken", "Poi", "Haupia", "Shave Ice"]
};

const descriptions = [
  "Authentic flavors delivered fresh to your door.",
  "Delicious meals made with the finest ingredients.",
  "Fast delivery, great taste, every time.",
  "Your favorite dishes, now available for delivery.",
  "Quality food, quick service, satisfied customers.",
  "Traditional recipes with a modern twist.",
  "Fresh ingredients, bold flavors, amazing taste.",
  "Experience the best in food delivery.",
  "From our kitchen to your table, fast and fresh.",
  "Satisfy your cravings with our delicious menu."
];

const reviewComments = [
  "Amazing food! Will definitely order again.",
  "Fast delivery and great taste.",
  "Highly recommend this restaurant.",
  "Best meal I've had in a while.",
  "Fresh ingredients and perfect flavors.",
  "Great service and delicious food.",
  "Exceeded my expectations!",
  "Will be ordering from here regularly.",
  "Perfect for a quick and tasty meal.",
  "Absolutely loved it!",
  "Great value for money.",
  "The food was hot and fresh.",
  "Excellent quality and taste.",
  "Quick delivery, amazing food.",
  "One of my favorite places to order from."
];

const firstNames = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Sage", "River", "Blake", "Cameron", "Dakota", "Emery", "Finley", "Harper",
  "Hayden", "Jamie", "Kai", "Logan", "Marley", "Noah", "Parker", "Reese",
  "Rowan", "Sage", "Skylar", "Tatum", "Willow", "Zion", "Aaron", "Ben",
  "Chris", "Dan", "Emma", "Frank", "Grace", "Henry", "Iris", "Jack"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
  "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
  "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King"
];

const deliveryTimes = [
  "20-30 min", "25-35 min", "30-40 min", "30-45 min", "35-45 min", "35-50 min",
  "40-55 min", "45-55 min", "50-60 min", "50-65 min"
];

const pickupTimes = [
  "6 min", "7 min", "8 min", "9 min", "10 min", "11 min", "12 min", "13 min",
  "14 min", "15 min", "16 min", "17 min", "18 min", "20 min", "22 min", "25 min"
];

const DEFAULT_SIZES = [
  { name: "Small", cal: 230, priceMod: 0 },
  { name: "Medium", cal: 320, priceMod: 0.9 },
  { name: "Large", cal: 480, priceMod: 1.6 }
];

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

function generateRestaurantName(cuisine) {
  const usePrefix = Math.random() > 0.7;
  const useSuffix = Math.random() > 0.5;
  
  if (usePrefix && useSuffix) {
    const prefix = randomFrom(restaurantPrefixes);
    const base = randomFrom(restaurantNames).split(" ")[0];
    const suffix = randomFrom(restaurantSuffixes);
    return `${prefix} ${base} ${suffix}`;
  } else if (usePrefix) {
    const prefix = randomFrom(restaurantPrefixes);
    const base = randomFrom(restaurantNames);
    return `${prefix} ${base}`;
  } else if (useSuffix) {
    const base = randomFrom(restaurantNames).split(" ")[0];
    const suffix = randomFrom(restaurantSuffixes);
    return `${base} ${suffix}`;
  } else {
    const base = randomFrom(restaurantNames);
    const variation = randomInt(1, 999);
    return `${base} ${variation}`;
  }
}

function generateMenuItem(cuisine, restaurantId, itemIndex) {
  const itemTypes = menuItemTypes[cuisine] || menuItemTypes["American"];
  const baseType = randomFrom(itemTypes);
  const variations = ["Classic", "Deluxe", "Spicy", "Premium", "Special", "Original", "Signature"];
  const variation = Math.random() > 0.5 ? randomFrom(variations) : "";
  const name = variation ? `${variation} ${baseType}` : baseType;
  
  const price = randomFloat(5.0, 25.0);
  const hasSizes = Math.random() > 0.6;
  const hasOptions = Math.random() > 0.5;
  
  const item = {
    id: `${restaurantId}-${itemIndex}`,
    name,
    description: `Delicious ${name.toLowerCase()} made with fresh ingredients.`,
    price: Number(price.toFixed(2)),
    image: `/images/${name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
  };
  
  if (hasSizes) {
    item.sizes = DEFAULT_SIZES;
  }
  
  if (hasOptions) {
    const optionLabels = ["No Onion", "No Tomato", "Extra Cheese", "No Sauce", "Spicy", "Mild", "Extra Sauce"];
    const optionCount = randomInt(1, 3);
    item.options = [];
    for (let i = 0; i < optionCount; i++) {
      const label = randomFrom(optionLabels);
      if (!item.options.find(opt => opt.label === label)) {
        item.options.push({ label });
      }
    }
  }
  
  return item;
}

function generateReview() {
  const firstName = randomFrom(firstNames);
  const lastName = randomFrom(lastNames);
  const author = `${firstName} ${lastName.charAt(0)}.`;
  const rating = randomInt(4, 5);
  const comment = randomFrom(reviewComments);
  const date = formatDate(randomDate(new Date("2024-01-01"), new Date("2025-12-31")));
  const avatarGender = Math.random() > 0.5 ? "men" : "women";
  const avatarNum = randomInt(1, 99);
  const avatar = `https://randomuser.me/api/portraits/${avatarGender}/${avatarNum}.jpg`;
  
  return { author, rating, comment, date, avatar };
}

function generateRestaurants(existingRestaurants, count) {
  const existingIds = new Set(existingRestaurants.map((r) => (r.id || "").toLowerCase()));
  const existingNames = new Set(existingRestaurants.map((r) => (r.name || "").toLowerCase()));

  const newRestaurants = [];
  let attempts = 0;
  let nextId = existingRestaurants.length > 0
    ? Math.max(...existingRestaurants.map(r => {
        const match = (r.id || "").match(/^(\d+)$/);
        return match ? Number.parseInt(match[1], 10) : 0;
      })) + 1
    : 1;

  while (newRestaurants.length < count && attempts < count * 20) {
    const id = String(nextId);
    
    if (existingIds.has(id.toLowerCase())) {
      nextId += 1;
      attempts += 1;
      continue;
    }

    const cuisine = randomFrom(cuisineTypes);
    let name = generateRestaurantName(cuisine);
    let nameAttempt = 0;
    while (existingNames.has(name.toLowerCase()) && nameAttempt < 10) {
      name = generateRestaurantName(cuisine);
      nameAttempt += 1;
    }
    if (existingNames.has(name.toLowerCase())) {
      name = `${name} ${randomInt(100, 999)}`;
    }

    const rating = randomFloat(4.0, 5.0);
    const featured = Math.random() > 0.7;
    const description = randomFrom(descriptions);
    const image = `/images/${name.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    
    const menuItemCount = randomInt(2, 5);
    const menu = [];
    for (let i = 1; i <= menuItemCount; i++) {
      menu.push(generateMenuItem(cuisine, id, i));
    }
    
    const reviewCount = randomInt(2, 4);
    const reviews = [];
    for (let i = 0; i < reviewCount; i++) {
      reviews.push(generateReview());
    }
    
    const deliveryTime = randomFrom(deliveryTimes);
    const pickupTime = randomFrom(pickupTimes);

    const restaurant = {
      id,
      name,
      description,
      image,
      cuisine,
      rating: Number(rating.toFixed(1)),
      ...(featured && { featured: true }),
      menu,
      reviews,
      deliveryTime,
      pickupTime,
    };

    existingIds.add(id.toLowerCase());
    existingNames.add(name.toLowerCase());
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

