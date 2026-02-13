/**
 * Enhanced Restaurants Data with Seeded Selection Support
 *
 * This file provides restaurant data loading from the web server
 * using seeded selection based on v2 seed.
 */

import {
  fetchSeededSelection,
  isDbLoadModeEnabled,
} from "@/shared/seeded-loader";
import { clampBaseSeed } from "@/shared/seed-resolver";
import fallbackRestaurants from "./original/restaurants_1.json";

export interface RestaurantGenerated {
  id: string;
  name: string;
  image: string;
  cuisine?: string;
  area?: string;
  reviews?: number;
  rating?: number; // rating con decimales
  stars?: number; // stars entero 1-5
  price?: string;
  bookings?: number;
}

type DatasetRestaurant = {
  id?: string;
  name?: string;
  namepool?: string;
  image?: string;
  cuisine?: string;
  area?: string;
  reviews?: number;
  rating?: number;
  stars?: number;
  price?: string;
  bookings?: number;
};

const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  // Leer seed base de la URL
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

// Cache for loaded restaurants
export let dynamicRestaurants: RestaurantGenerated[] = [];

/**
 * Normalize restaurant data from server
 */
function normalizeRestaurantWithIndex(
  r: DatasetRestaurant,
  index = 0
): RestaurantGenerated {
    const fallbackName = (r as any)?.namepool;
    const normalizedName =
      typeof r.name === "string" && r.name.trim().length > 0
        ? r.name.trim()
        : typeof fallbackName === "string" && fallbackName.trim().length > 0
        ? fallbackName.trim()
        : `Restaurant ${index + 1}`;

    const providedImage = r.image;
    const normalizedImage =
      typeof providedImage === "string" && providedImage.trim().length > 0
        ? providedImage
        : `/images/restaurant${(index % 19) + 1}.jpg`;

    // Preservar rating y stars directamente del JSON si existen
    // Si no existen, usar valores por defecto o calcular desde campos antiguos
    const rating = r.rating ?? (r as any)?.staticStars ?? 4.5;
    // Si stars viene del JSON, usarlo directamente; sino calcular desde rating
    const stars =
      r.stars !== undefined && r.stars !== null ? r.stars : Math.round(rating);
    const reviews = r.reviews ?? (r as any)?.staticReviews ?? 0;
    const bookings = r.bookings ?? (r as any)?.staticBookings ?? 0;
    const price = r.price || (r as any)?.staticPrices || "$$";

    return {
      id: r.id || `gen-${index + 1}`,
      name: normalizedName,
      image: normalizedImage,
      cuisine: r.cuisine || (r as any)?.cuisine || "International",
      area: r.area || (r as any)?.area || "Downtown",
      reviews,
      rating,
      stars,
      price,
      bookings,
    };
}

function normalizeRestaurants(
  items: DatasetRestaurant[]
): RestaurantGenerated[] {
  return items.map((r, index) => normalizeRestaurantWithIndex(r, index));
}

/**
 * Get restaurants (from cache or static fallback)
 */
export function getRestaurants(): RestaurantGenerated[] {
  // Si hay dynamic restaurants, usarlos
  if (dynamicRestaurants.length > 0) {
    return dynamicRestaurants;
  }

  // Si no, usar el JSON actualizado directamente (ya tiene rating y stars)
  return (fallbackRestaurants as any[]).map((item) => ({
    id: `restaurant-${item.id}`,
    name: item.namepool,
    image: item.image || `/images/restaurant${parseInt(item.id) % 19 || 1}.jpg`,
    rating: item.rating ?? 4.5,
    stars: item.stars ?? 5,
    reviews: item.reviews ?? 0,
    cuisine: item.cuisine,
    price: item.price ?? "$$",
    bookings: item.bookings ?? 0,
    area: item.area,
  }));
}

/**
 * Initialize restaurants from server using seeded selection
 */
export async function initializeRestaurants(seedOverride?: number | null): Promise<RestaurantGenerated[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();
  const effectiveSeed = clampBaseSeed(seedOverride ?? baseSeed ?? 1);
  if (effectiveSeed === 1 && dbModeEnabled) {
    console.log("[autodining] Base seed is 1, using original data (skipping DB/AI modes)");
    dynamicRestaurants = normalizeRestaurants(fallbackRestaurants as DatasetRestaurant[]);
    return dynamicRestaurants;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    try {
      const restaurants = await fetchSeededSelection<DatasetRestaurant>({
        projectKey: "web_4_autodining",
        entityType: "restaurants",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "distribute",
        filterKey: "cuisine",
      });

      if (Array.isArray(restaurants) && restaurants.length > 0) {
        console.log(
          `[autodining] Loaded ${restaurants.length} restaurants from dataset (seed=${effectiveSeed})`
        );
        dynamicRestaurants = normalizeRestaurants(restaurants);
        return dynamicRestaurants;
      }

      // If no restaurants returned from backend, fallback to local JSON
      console.warn(`[autodining] No restaurants returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      // If backend fails, fallback to local JSON
      console.warn("[autodining] Backend unavailable, falling back to local JSON:", error);
    }
  }

  // Fallback to local JSON
  dynamicRestaurants = normalizeRestaurants(fallbackRestaurants as DatasetRestaurant[]);
  return dynamicRestaurants;
}
