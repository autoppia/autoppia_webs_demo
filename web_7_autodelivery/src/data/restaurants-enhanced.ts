/**
 * Enhanced Restaurants Data with AI Generation Support
 * 
 * This file provides both static and dynamic restaurant data generation
 * for the Food Delivery application.
 */

import type { Restaurant } from "@/data/restaurants";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { clampBaseSeed } from "@/shared/seed-resolver";
import fallbackRestaurants from "./original/restaurants_1.json";

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

    // Safely get restaurant image - ensure it's a string
    let image: string = typeof restaurant.image === 'string' ? restaurant.image : String(restaurant.image || '');
    
    // Ensure restaurant image is valid
    if (!image || (!image.startsWith("/images/") && !image.includes("unsplash.com"))) {
      // Default fallback image based on cuisine - safely get cuisine as string
      const cuisineFallback: Record<string, string> = {
        Italian: "/images/pizza-palace.jpg",
        Japanese: "/images/sushi-world.jpg",
        Indian: "/images/curry-house.jpg",
        Mexican: "/images/taco-fiesta.jpg",
        American: "/images/burger-joint.jpg",
      };
      const cuisine = typeof restaurant.cuisine === 'string' ? restaurant.cuisine : String(restaurant.cuisine || 'Italian');
      image = cuisineFallback[cuisine] || "/images/pizza-palace.jpg";
    }

    // Safely handle menu items
    const normalizedMenu = Array.isArray(restaurant.menu) 
      ? restaurant.menu.map((item) => {
          if (!item || typeof item !== 'object') {
            console.warn('normalizeRestaurantImages: invalid menu item:', item);
            return item;
          }
          // Safely get menu item image - ensure name and image are strings before using string methods
          let menuItemImage: string = typeof item.image === 'string' ? item.image : String(item.image || '');
          if (!menuItemImage || (!menuItemImage.startsWith("/images/") && !menuItemImage.includes("unsplash.com"))) {
            try {
              const itemName = typeof item.name === 'string' ? item.name : String(item.name || 'menu-item');
              // Ensure itemName is actually a string and has toLowerCase method
              if (typeof itemName === 'string' && typeof itemName.toLowerCase === 'function') {
                menuItemImage = `/images/${itemName.toLowerCase().replace(/ /g, "-")}.jpg`;
              } else {
                menuItemImage = '/images/menu-item.jpg';
              }
            } catch (error) {
              console.warn('normalizeRestaurantImages: Error processing menu item name:', item.name, error);
              menuItemImage = '/images/menu-item.jpg';
            }
          }
          return {
            ...item,
            // Ensure menu item images are valid
            image: menuItemImage,
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
 * Get base seed from URL
 */
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

const clampSeed = (seed: number): number => {
  if (Number.isNaN(seed)) return 1;
  if (seed < 1) return 1;
  if (seed > 300) return 300;
  return seed;
};

const resolveSeed = (seedValue?: number | null): number => {
  const baseSeed = getBaseSeedFromUrl();
  return clampSeed(seedValue ?? baseSeed ?? 1);
};

// Dynamic restaurants array
let dynamicRestaurants: Restaurant[] = [];

/**
 * Initialize restaurants with V2 system (DB mode or fallback)
 */
export async function initializeRestaurants(seedOverride?: number | null): Promise<Restaurant[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);

  if (effectiveSeed === 1 && dbModeEnabled) {
    console.log("[autodelivery] Base seed is 1 and V2 enabled, using original data (skipping DB/AI modes)");
    dynamicRestaurants = normalizeRestaurantImages(fallbackRestaurants as Restaurant[]);
    console.log("[autodelivery] Loaded original restaurants:", dynamicRestaurants.length);
    return dynamicRestaurants;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[autodelivery] DB mode enabled, attempting to load from DB...");
    console.log("[autodelivery] effectiveSeed:", effectiveSeed);
    console.log("[autodelivery] Effective seed for DB load:", effectiveSeed);

    try {
      console.log("[autodelivery] Calling fetchSeededSelection with:", {
        projectKey: "web_7_autodelivery",
        entityType: "restaurants",
        seedValue: effectiveSeed,
        limit: 50,
        method: "distribute",
        filterKey: "cuisine",
      });
      
      const restaurants = await fetchSeededSelection<Restaurant>({
        projectKey: "web_7_autodelivery",
        entityType: "restaurants",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "distribute",
        filterKey: "cuisine",
      });

      console.log("[autodelivery] fetchSeededSelection returned:", restaurants?.length, "restaurants");
      console.log("[autodelivery] First few restaurants:", restaurants?.slice(0, 3));

      if (Array.isArray(restaurants) && restaurants.length > 0) {
        console.log(
          `[autodelivery] ✅ Successfully loaded ${restaurants.length} restaurants from dataset (seed=${effectiveSeed})`
        );
        dynamicRestaurants = normalizeRestaurantImages(restaurants);
        return dynamicRestaurants;
      }

      console.warn(`[autodelivery] ⚠️ No restaurants returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.error("[autodelivery] ❌ Backend unavailable, falling back to local JSON. Error:", error);
      if (error instanceof Error) {
        console.error("[autodelivery] Error message:", error.message);
        console.error("[autodelivery] Error stack:", error.stack);
      }
    }
  }

  // Fallback to local JSON
  dynamicRestaurants = normalizeRestaurantImages(fallbackRestaurants as Restaurant[]);
  return dynamicRestaurants;
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadRestaurantsFromDb(seedOverride?: number | null): Promise<Restaurant[]> {
  if (!isDbLoadModeEnabled()) {
    console.log("[autodelivery] loadRestaurantsFromDb: DB mode not enabled, returning empty array");
    return [];
  }
  
  // Check base seed from URL - if seed = 1, return empty array to trigger fallback
  const baseSeed = getBaseSeedFromUrl();
  const fallbackSeed = getSeedValueFromEnv(1);
  const seed = (typeof seedOverride === "number" && seedOverride > 0) ? seedOverride : fallbackSeed;
  
  console.log("[autodelivery] loadRestaurantsFromDb - baseSeed:", baseSeed, "seedOverride:", seedOverride, "final seed:", seed);
  
  // If seed = 1, return empty array so initializeRestaurants will use fallback data
  if (baseSeed === 1 || seed === 1) {
    console.log("[autodelivery] loadRestaurantsFromDb: seed is 1, returning empty array to use fallback data");
    return [];
  }
  
  try {
    const limit = 50; // Fixed limit of 50 items
    console.log("[autodelivery] loadRestaurantsFromDb: Fetching from server with seed:", seed, "limit:", limit);
    // Prefer distributed selection to avoid cuisine dominance
    const distributed = await fetchSeededSelection<Restaurant>({
      projectKey: "web_7_autodelivery",
      entityType: "restaurants",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "cuisine",
    });
    const selected = Array.isArray(distributed) && distributed.length > 0 ? distributed : await fetchSeededSelection<Restaurant>({
      projectKey: "web_7_autodelivery",
      entityType: "restaurants",
      seedValue: seed,
      limit,
      method: "select",
    });
    if (selected && selected.length > 0) {
      console.log("[autodelivery] loadRestaurantsFromDb: ✅ Successfully loaded", selected.length, "restaurants from DB");
      return normalizeRestaurantImages(selected);
    } else {
      console.warn("[autodelivery] loadRestaurantsFromDb: ⚠️ No restaurants selected from DB (selected length:", selected?.length, ")");
    }
  } catch (e) {
    console.error("[autodelivery] loadRestaurantsFromDb: ❌ Failed to load seeded restaurant selection from DB:", e);
    if (e instanceof Error) {
      console.error("[autodelivery] Error message:", e.message);
      console.error("[autodelivery] Error stack:", e.stack);
    }
  }
  
  console.log("[autodelivery] loadRestaurantsFromDb: Returning empty array");
  return [];
}

// Export the dynamic restaurants array for direct access
export { dynamicRestaurants as restaurants };
