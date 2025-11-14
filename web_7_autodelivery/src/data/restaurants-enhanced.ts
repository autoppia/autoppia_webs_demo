/**
 * Enhanced Restaurants Data with AI Generation Support
 * 
 * This file provides both static and dynamic restaurant data generation
 * for the Auto Delivery application.
 */

import type { Restaurant } from "@/data/restaurants";
import { readJson, writeJson } from "@/shared/storage";
import { 
  generateRestaurantsWithFallback,
  isDataGenerationAvailable 
} from "@/utils/restaurantDataGenerator";
import { fetchSeededSelection, getSeedValueFromEnv, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { restaurants as originalRestaurants } from "@/data/restaurants";

// Configuration for data generation
const DATA_GENERATION_CONFIG = {
  DEFAULT_DELAY_BETWEEN_CALLS: 1000,
  DEFAULT_RESTAURANTS_PER_CATEGORY: 8,
  MAX_RETRY_ATTEMPTS: 2,
  AVAILABLE_CATEGORIES: ["Italian", "Japanese", "Indian", "Mexican", "American"]
};

// Helper function to normalize restaurant images
function normalizeRestaurantImages(restaurants: Restaurant[]): Restaurant[] {
  if (!Array.isArray(restaurants)) {
    console.warn('normalizeRestaurantImages: restaurants is not an array:', restaurants);
    return [];
  }
  
  return restaurants.map((restaurant) => {
    if (!restaurant || typeof restaurant !== 'object') {
      console.warn('normalizeRestaurantImages: invalid restaurant object:', restaurant);
      return restaurant;
    }

    let image = restaurant.image;
    
    // Ensure restaurant image is valid
    if (!image || (!image.startsWith("/images/") && !image.includes("unsplash.com"))) {
      // Default fallback image based on cuisine
      const cuisineFallback: Record<string, string> = {
        Italian: "/images/pizza-palace.jpg",
        Japanese: "/images/sushi-world.jpg",
        Indian: "/images/curry-house.jpg",
        Mexican: "/images/taco-fiesta.jpg",
        American: "/images/burger-joint.jpg",
      };
      image = cuisineFallback[restaurant.cuisine] || "/images/pizza-palace.jpg";
    }

    // Safely handle menu items
    const normalizedMenu = Array.isArray(restaurant.menu) 
      ? restaurant.menu.map((item) => {
          if (!item || typeof item !== 'object') {
            console.warn('normalizeRestaurantImages: invalid menu item:', item);
            return item;
          }
          return {
            ...item,
            // Ensure menu item images are valid
            image: item.image && (item.image.startsWith("/images/") || item.image.includes("unsplash.com"))
              ? item.image
              : `/images/${item.name?.toLowerCase().replace(/ /g, "-") || 'menu-item'}.jpg`,
          };
        })
      : [];

    return {
      ...restaurant,
      image,
      menu: normalizedMenu,
    };
  });
}

/**
 * Generate restaurants for multiple categories with bounded concurrency
 */
async function generateRestaurantsForCategories(
  categories: string[],
  restaurantsPerCategory: number = DATA_GENERATION_CONFIG.DEFAULT_RESTAURANTS_PER_CATEGORY,
  delayBetweenCalls: number = DATA_GENERATION_CONFIG.DEFAULT_DELAY_BETWEEN_CALLS
): Promise<Restaurant[]> {
  const allGeneratedRestaurants: Restaurant[] = [];
  const maxConcurrent = 3; // Limit concurrent API calls
  
  console.log(`🚀 Starting async restaurant data generation for each cuisine...`);
  console.log(`📡 Using API: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'}`);
  console.log(`📊 Will generate ${restaurantsPerCategory} restaurants per cuisine`);
  console.log(`🏷️ Cuisines: ${categories.join(', ')}`);

  // Process categories in batches to avoid overwhelming the server
  for (let i = 0; i < categories.length; i += maxConcurrent) {
    const batch = categories.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (category) => {
      console.log(`Generating ${restaurantsPerCategory} restaurants for ${category}...`);
      
      try {
        const result = await generateRestaurantsWithFallback(
          originalRestaurants,
          restaurantsPerCategory,
          [category]
        );
        
        console.log(`✅ Generated ${result.length} restaurants for ${category}`);
        return result;
      } catch (error) {
        console.error(`❌ Failed to generate restaurants for ${category}:`, error);
        return [];
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(result => Array.isArray(result));
    allGeneratedRestaurants.push(...validResults.flat());

    // Add delay between batches to be respectful to the API
    if (i + maxConcurrent < categories.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
    }
  }

  return allGeneratedRestaurants;
}

/**
 * Main initialization function for restaurants
 */
export async function initializeRestaurants(): Promise<Restaurant[]> {
  if (!isDataGenerationAvailable()) {
    console.log("🔍 Data generation not available, using original restaurants");
    return originalRestaurants;
  }

  // Check cache first
  const cached = readCachedRestaurants();
  if (cached && cached.length > 0) {
    console.log("🔍 Using cached restaurants:", cached.length, "items");
    return cached;
  }

  try {
    const categories = DATA_GENERATION_CONFIG.AVAILABLE_CATEGORIES;
    const restaurantsPerCategory = DATA_GENERATION_CONFIG.DEFAULT_RESTAURANTS_PER_CATEGORY;
    
    const allGeneratedRestaurants = await generateRestaurantsForCategories(
      categories,
      restaurantsPerCategory,
      DATA_GENERATION_CONFIG.DEFAULT_DELAY_BETWEEN_CALLS
    );

    if (!Array.isArray(allGeneratedRestaurants) || allGeneratedRestaurants.length === 0) {
      console.log("No restaurants were generated for any category, returning existing restaurants.");
      return originalRestaurants;
    }

    try {
      // Normalize images and cache results
      const normalizedRestaurants = normalizeRestaurantImages(allGeneratedRestaurants);
      
      if (!Array.isArray(normalizedRestaurants) || normalizedRestaurants.length === 0) {
        console.warn("Normalization failed, using original restaurants");
        return originalRestaurants;
      }
      
      writeCachedRestaurants(normalizedRestaurants);
      console.log(`✅ Successfully generated and cached ${normalizedRestaurants.length} restaurants`);
      return normalizedRestaurants;
    } catch (error) {
      console.error("Error during restaurant normalization:", error);
      return originalRestaurants;
    }
  } catch (error) {
    console.error("❌ Failed to generate restaurants:", error);
    return originalRestaurants;
  }
}

/**
 * Load restaurants from database with seeded selection
 */
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
      projectKey: "web_7_autodelivery",
      entityType: "restaurants",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "cuisine",
    });
    
    console.log("🔍 Distributed selection result:", distributed?.length || 0, "items");
    
    const selected = Array.isArray(distributed) && distributed.length > 0
      ? distributed
      : await fetchSeededSelection<Restaurant>({
          projectKey: "web_7_autodelivery",
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
      
      // Group selected restaurants by cuisine
      selected.forEach(restaurant => {
        if (!byCuisine[restaurant.cuisine]) {
          byCuisine[restaurant.cuisine] = [];
        }
        byCuisine[restaurant.cuisine].push(restaurant);
      });
      
      // Supplement missing cuisines with original restaurants
      const supplemented: Restaurant[] = [...selected];
      cuisines.forEach(cuisine => {
        if (!byCuisine[cuisine] || byCuisine[cuisine].length === 0) {
          const originalForCuisine = originalRestaurants.filter(r => r.cuisine === cuisine);
          supplemented.push(...originalForCuisine.slice(0, 2)); // Add up to 2 original restaurants per missing cuisine
        }
      });
      
      // Remove duplicates by ID
      const uniqueRestaurants = supplemented.filter((restaurant, index, self) => 
        index === self.findIndex(r => r.id === restaurant.id)
      );
      
      const normalizedRestaurants = normalizeRestaurantImages(uniqueRestaurants);
      console.log("🔍 DB restaurants loaded:", normalizedRestaurants.length, "items");
      return normalizedRestaurants;
    }
    
    console.log("🔍 No restaurants found in DB, falling back to original restaurants");
    return originalRestaurants;
  } catch (error) {
    console.error("❌ Failed to load restaurants from DB:", error);
    return originalRestaurants;
  }
}

// Cache management
const CACHE_KEY = 'autodelivery_generated_restaurants_v1';

export function readCachedRestaurants(): Restaurant[] | null {
  return readJson<Restaurant[]>(CACHE_KEY);
}

export function writeCachedRestaurants(restaurants: Restaurant[]): void {
  writeJson(CACHE_KEY, restaurants);
}
