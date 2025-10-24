/**
 * Enhanced Restaurants Data with AI Generation Support
 * 
 * This file provides both static and dynamic restaurant data generation
 * for the Food Delivery Platform application.
 */

import type { Restaurant } from "@/data/restaurants";
import { restaurants as originalRestaurants } from "@/data/restaurants";
import { readJson, writeJson } from "@/shared/storage";
import {
  generateRestaurantsWithFallback,
  replaceAllRestaurants,
  addGeneratedRestaurants,
  isDataGenerationAvailable,
} from "@/utils/restaurantDataGenerator";
import {
  fetchSeededSelection,
  getSeedValueFromEnv,
  isDbLoadModeEnabled,
} from "@/shared/seeded-loader";

// Helper function to normalize restaurant images
function normalizeRestaurantImages(restaurants: Restaurant[]): Restaurant[] {
  const localImageMap: Record<string, string> = {
    "Pizza Palace": "/images/pizza-palace.jpg",
    "Sushi World": "/images/sushi-world.jpg",
    "Curry House": "/images/curry-house.jpg",
    "Taco Fiesta": "/images/taco-fiesta.jpg",
    "Burger Joint": "/images/burger-joint.jpg",
  };

  return restaurants.map((r) => {
    let image = r.image;

    // Use local image if available
    if (localImageMap[r.name]) {
      image = localImageMap[r.name];
    } else if (!image || (!image.startsWith("/images/") && !image.includes("unsplash.com") && !image.includes("source.unsplash.com"))) {
      // Default fallback image based on cuisine
      const cuisineFallback: Record<string, string> = {
        Italian: "/images/pizza-palace.jpg",
        Japanese: "/images/sushi-world.jpg",
        Indian: "/images/curry-house.jpg",
        Mexican: "/images/taco-fiesta.jpg",
        American: "/images/burger-joint.jpg",
      };
      image = cuisineFallback[r.cuisine] || "/images/pizza-palace.jpg";
    }

    return {
      ...r,
      image,
      menu: r.menu.map((item) => ({
        ...item,
        // Ensure menu item images are valid
        image: item.image && (item.image.startsWith("/images/") || item.image.includes("unsplash.com"))
          ? item.image
          : `/images/${item.name.toLowerCase().replace(/ /g, "-")}.jpg`,
      })),
    };
  });
}

// Dynamic restaurants array that can be populated with generated data
let dynamicRestaurants: Restaurant[] = isDataGenerationAvailable()
  ? []
  : [...originalRestaurants];

// Client-side cache to avoid regenerating on every reload
export function readCachedRestaurants(): Restaurant[] | null {
  return readJson<Restaurant[]>("food_delivery_generated_restaurants_v1", null);
}

export function writeCachedRestaurants(restaurantsToCache: Restaurant[]): void {
  writeJson("food_delivery_generated_restaurants_v1", restaurantsToCache);
}

// Configuration for async data generation
const DATA_GENERATION_CONFIG = {
  // Default delay between category calls (in milliseconds)
  DEFAULT_DELAY_BETWEEN_CALLS: 1000,
  // Default restaurants per category
  DEFAULT_RESTAURANTS_PER_CATEGORY: 2,
  // Maximum retry attempts for failed category generation
  MAX_RETRY_ATTEMPTS: 2,
  // Available categories for data generation
  AVAILABLE_CATEGORIES: [
    "Italian",
    "Japanese",
    "Indian",
    "Mexican",
    "American",
  ],
};

/**
 * Utility function to generate restaurants for multiple categories with delays
 * Prevents server overload by spacing out API calls
 */
async function generateRestaurantsForCategories(
  categories: string[],
  restaurantsPerCategory: number,
  delayBetweenCalls: number = 200,
  existingRestaurants: Restaurant[] = []
): Promise<Restaurant[]> {
  let allGeneratedRestaurants: Restaurant[] = [];

  // Bounded concurrency (e.g., 3 at a time)
  const concurrencyLimit = 3;
  let index = 0;

  async function worker() {
    while (index < categories.length) {
      const currentIndex = index++;
      const category = categories[currentIndex];
      try {
        console.log(`Generating ${restaurantsPerCategory} restaurants for ${category}...`);
        const categoryRestaurants = await generateRestaurantsWithFallback(
          [],
          restaurantsPerCategory,
          [category]
        );
        allGeneratedRestaurants = [...allGeneratedRestaurants, ...categoryRestaurants];
        console.log(`✅ Generated ${categoryRestaurants.length} restaurants for ${category}`);
      } catch (categoryError) {
        console.warn(`Failed to generate restaurants for ${category}:`, categoryError);
      }
      // small gap to avoid burst
      if (currentIndex < categories.length - 1 && delayBetweenCalls > 0) {
        await new Promise((r) => setTimeout(r, delayBetweenCalls));
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrencyLimit, categories.length) },
    () => worker()
  );
  await Promise.all(workers);

  if (allGeneratedRestaurants.length > 0) {
    return allGeneratedRestaurants;
  } else {
    console.warn("No restaurants were generated for any category, returning existing restaurants.");
    return existingRestaurants;
  }
}

/**
 * Initialize restaurants with data generation if enabled
 * Uses async calls for each category to avoid overwhelming the server
 */
export async function initializeRestaurants(): Promise<Restaurant[]> {
  // Preserve existing behavior: use generation when enabled, else static data
  if (isDataGenerationAvailable()) {
    try {
      // Use cached restaurants on client to prevent re-generation on reloads
      const cached = readCachedRestaurants();
      if (cached && cached.length > 0) {
        dynamicRestaurants = normalizeRestaurantImages(cached);
        return dynamicRestaurants;
      }

      console.log("🚀 Starting async restaurant data generation for each cuisine...");
      console.log("📡 Using API:", process.env.API_URL || "http://app:8080");

      // Define categories and restaurants per category
      const categories = DATA_GENERATION_CONFIG.AVAILABLE_CATEGORIES;
      const restaurantsPerCategory = DATA_GENERATION_CONFIG.DEFAULT_RESTAURANTS_PER_CATEGORY;
      const delayBetweenCalls = DATA_GENERATION_CONFIG.DEFAULT_DELAY_BETWEEN_CALLS;

      console.log(`📊 Will generate ${restaurantsPerCategory} restaurants per cuisine`);
      console.log(`🏷️  Cuisines: ${categories.join(", ")}`);

      // Generate restaurants for all categories with delays
      let allGeneratedRestaurants = await generateRestaurantsForCategories(
        categories,
        restaurantsPerCategory,
        delayBetweenCalls,
        originalRestaurants
      );

      // Normalize category field to one of the allowed categories
      const allowed = new Set(categories);
      allGeneratedRestaurants = allGeneratedRestaurants.map((r) => ({
        ...r,
        cuisine: allowed.has(r.cuisine || "") ? r.cuisine : r.cuisine ? r.cuisine : "American",
      }));

      // Normalize and resolve images to concrete URLs
      allGeneratedRestaurants = normalizeRestaurantImages(allGeneratedRestaurants);

      dynamicRestaurants = allGeneratedRestaurants;
      // Cache generated restaurants on client
      writeCachedRestaurants(dynamicRestaurants);
      return dynamicRestaurants;
    } catch (error) {
      console.warn(
        "⚠️ Failed to generate restaurants while generation is enabled. Keeping restaurants empty until ready. Error:",
        error
      );
      // When data generation is enabled, do NOT fall back to static data; return empty
      dynamicRestaurants = [];
      return dynamicRestaurants;
    }
  } else {
    console.log("ℹ️ Data generation is disabled, using original static restaurants");
    dynamicRestaurants = originalRestaurants;
    return dynamicRestaurants;
  }
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadRestaurantsFromDb(): Promise<Restaurant[]> {
  if (!isDbLoadModeEnabled()) {
    console.log("🔍 DB mode not enabled, returning empty array");
    return [];
  }

  try {
    const seed = getSeedValueFromEnv(1);
    const limit = 100;
    console.log("🔍 Attempting to load restaurants from DB with seed:", seed, "limit:", limit);
    // Prefer distributed selection to avoid category dominance
    const distributed = await fetchSeededSelection<Restaurant>({
      projectKey: "web_7_food_delivery_v2",
      entityType: "restaurants",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "cuisine",
    });
    console.log("🔍 Distributed selection result:", distributed?.length || 0, "items");
    const selected =
      Array.isArray(distributed) && distributed.length > 0
        ? distributed
        : await fetchSeededSelection<Restaurant>({
            projectKey: "web_7_food_delivery_v2",
            entityType: "restaurants",
            seedValue: seed,
            limit,
            method: "select",
          });
    console.log("🔍 Final selected restaurants:", selected?.length || 0, "items");

    if (selected && selected.length > 0) {
      // Ensure we have at least some items for all primary cuisines by supplementing with originals if needed
      const cuisines = ["Italian", "Japanese", "Indian", "Mexican", "American"];
      const byCuisine: Record<string, Restaurant[]> = {};
      for (const r of selected) {
        const cui = r.cuisine || "American";
        byCuisine[cui] = byCuisine[cui] || [];
        byCuisine[cui].push(r);
      }

      // Pull minimal items from originals to fill missing cuisines
      const supplemented: Restaurant[] = [...selected];
      for (const cui of cuisines) {
        if (!byCuisine[cui] || byCuisine[cui].length === 0) {
          const fallback = originalRestaurants.filter((r) => r.cuisine === cui).slice(0, 2);
          if (fallback.length > 0) {
            supplemented.push(...fallback);
          }
        }
      }

      // Deduplicate by id
      const seen = new Set<string>();
      const deduped = supplemented.filter((r) => {
        const id = r.id || `${r.name}-${r.cuisine}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return normalizeRestaurantImages(deduped);
    }
  } catch (e) {
    console.warn("Failed to load seeded restaurant selection from DB:", e);
  }

  return [];
}

/**
 * Get restaurants by cuisine
 */
export function getRestaurantsByCuisine(cuisine: string): Restaurant[] {
  return dynamicRestaurants.filter((restaurant) => restaurant.cuisine === cuisine);
}

/**
 * Get a restaurant by ID
 */
export function getRestaurantById(id: string): Restaurant | undefined {
  return dynamicRestaurants.find((restaurant) => restaurant.id === id);
}

/**
 * Get featured restaurants
 */
export function getFeaturedRestaurants(): Restaurant[] {
  return dynamicRestaurants.filter((restaurant) => restaurant.featured);
}

/**
 * Reset to original restaurants only
 */
export function resetToOriginalRestaurants(): void {
  dynamicRestaurants = [...originalRestaurants];
}

/**
 * Get statistics about current restaurants
 */
export function getRestaurantStats() {
  const cuisines = dynamicRestaurants.reduce((acc, restaurant) => {
    const cuisine = restaurant.cuisine || "Unknown";
    acc[cuisine] = (acc[cuisine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRestaurants: dynamicRestaurants.length,
    originalRestaurants: originalRestaurants.length,
    generatedRestaurants: dynamicRestaurants.length - originalRestaurants.length,
    featuredCount: dynamicRestaurants.filter((r) => r.featured).length,
    cuisines,
    averageRating:
      dynamicRestaurants.reduce((sum, r) => sum + (r.rating || 0), 0) /
      dynamicRestaurants.length,
  };
}

/**
 * Search restaurants by query
 */
export function searchRestaurants(query: string): Restaurant[] {
  const lowercaseQuery = query.toLowerCase();
  return dynamicRestaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(lowercaseQuery) ||
      restaurant.description?.toLowerCase().includes(lowercaseQuery) ||
      restaurant.cuisine?.toLowerCase().includes(lowercaseQuery)
  );
}

// Export the dynamic restaurants array for direct access
export { dynamicRestaurants as restaurants };
export { originalRestaurants };

