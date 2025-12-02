/**
 * Enhanced Restaurants Data with Seeded Selection Support
 * 
 * This file provides restaurant data loading from the web server
 * using seeded selection based on v2 seed.
 */

import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { RestaurantsData } from "@/library/dataset";
import fallbackRestaurants from "./original/restaurants_1.json";

export interface RestaurantGenerated {
  id: string;
  name: string;
  image: string;
  cuisine?: string;
  area?: string;
  reviews?: number;
  stars?: number;
  price?: string;
  bookings?: number;
}

// Cache for loaded restaurants
export let dynamicRestaurants: RestaurantGenerated[] = [];

/**
 * Normalize restaurant data from server
 */
function normalizeRestaurants(items: RestaurantGenerated[]): RestaurantGenerated[] {
  return items.map((r, index) => {
    const fallbackName = (r as any)?.namepool;
    const normalizedName = typeof r.name === "string" && r.name.trim().length > 0
      ? r.name.trim()
      : typeof fallbackName === "string" && fallbackName.trim().length > 0
        ? fallbackName.trim()
        : `Restaurant ${index + 1}`;

    const providedImage = r.image;
    const normalizedImage =
      typeof providedImage === "string" && providedImage.trim().length > 0
        ? providedImage
        : `/images/restaurant${(index % 19) + 1}.jpg`;

    return {
      id: r.id || `gen-${index + 1}`,
      name: normalizedName,
      image: normalizedImage,
      cuisine: r.cuisine || (r as any)?.cuisine || "International",
      area: r.area || (r as any)?.area || "Downtown",
      reviews: r.reviews ?? 0,
      stars: r.stars ?? 4,
      price: r.price || (r as any)?.staticPrices || "$$",
      bookings: r.bookings ?? (r as any)?.staticBookings ?? 0,
    };
  });
}

/**
 * Get restaurants (from cache or static fallback)
 */
export function getRestaurants(): RestaurantGenerated[] {
  return dynamicRestaurants.length > 0
    ? dynamicRestaurants
    : RestaurantsData.map((item, index) => ({
        id: `restaurant-${item.id}`,
        name: item.namepool,
        image: `/images/restaurant${(index % 19) + 1}.jpg`,
        stars: item.staticStars,
        reviews: item.staticReviews,
        cuisine: item.cuisine,
        price: item.staticPrices,
        bookings: item.staticBookings,
        area: item.area,
      }));
}

/**
 * Initialize restaurants from server using seeded selection
 */
export async function initializeRestaurants(seedValue?: number | null): Promise<RestaurantGenerated[]> {
  // Check if v2 (DB mode) is enabled
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {}

  // Determine the seed to use
  let effectiveSeed: number;
  effectiveSeed = dbModeEnabled ? seedValue ?? 1 : 1;

  if (!dbModeEnabled) {
    dynamicRestaurants = normalizeRestaurants(fallbackRestaurants as RestaurantGenerated[]);
    return dynamicRestaurants;
  }

  // Load from DB with the determined seed
  try {
    // Clear existing restaurants to force fresh load
    dynamicRestaurants = [];
    const fromDb = await fetchSeededSelection<RestaurantGenerated>({
      projectKey: "web_4_autodining",
      entityType: "restaurants",
      seedValue: effectiveSeed,
      limit: 100,
      method: "distribute",
      filterKey: "cuisine",
    });
    
    console.log(`[autodining] Fetched from DB with seed=${effectiveSeed}:`, fromDb);
    
    if (fromDb && fromDb.length > 0) {
      dynamicRestaurants = normalizeRestaurants(fromDb);
      // Don't cache when using seeds to ensure each seed gets fresh data
      return dynamicRestaurants;
    } else {
      console.warn(`[autodining] No data returned from DB with seed=${effectiveSeed}`);
      throw new Error(`[autodining] No data found for seed=${effectiveSeed}`);
    }
  } catch (err) {
    console.error(`[autodining] Failed to load from DB with seed=${effectiveSeed}:`, err);
    dynamicRestaurants = normalizeRestaurants(fallbackRestaurants as RestaurantGenerated[]);
    return dynamicRestaurants;
  }
}
