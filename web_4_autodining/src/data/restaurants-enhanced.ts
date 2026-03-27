/**
 * Enhanced Restaurants Data with Seeded Selection Support
 *
 * This file provides restaurant data loading from the web server
 * using seeded selection based on v2 seed.
 */

import {
  fetchSeededSelection,
} from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

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
  tags?: string[];
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
  staticStars?: number;
  staticReviews?: number;
  staticBookings?: number;
  staticPrices?: string;
  tags?: string[];
};

/**
 * Generate tags based on cuisine
 */
function generateTags(cuisine: string, index: number): string[] {
  const baseTags = ["top-rated", "local favourite", "outdoor seating", "good for groups", "romantic"];
  const cuisineTags: Record<string, string[]> = {
    "Italian": ["pasta", "pizza", "homemade", "authentic"],
    "French": ["gourmet", "fine dining", "wine list", "romantic"],
    "Japanese": ["sushi", "fresh", "minimalist", "tea"],
    "Mexican": ["spicy", "tacos", "vibrant", "margaritas"],
    "American": ["burgers", "classic", "family friendly", "casual"],
    "Spanish": ["tapas", "paella", "lively", "sharing"],
    "International": ["fusion", "modern", "creative", "diverse"],
  };

  const specificTags = cuisineTags[cuisine] || cuisineTags["International"];
  const selectedSpecific = specificTags[index % specificTags.length];
  const selectedBase = baseTags[(index + 2) % baseTags.length];
  const selectedBase2 = baseTags[(index + 5) % baseTags.length];

  return [selectedSpecific, selectedBase, selectedBase2].filter(Boolean);
}

// Cache for loaded restaurants
export let dynamicRestaurants: RestaurantGenerated[] = [];

/**
 * Normalize restaurant data from server
 */
function normalizeRestaurantWithIndex(
  r: DatasetRestaurant,
  index = 0
): RestaurantGenerated {
    const fallbackName = r.namepool;
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
    const rating = r.rating ?? r.staticStars ?? 4.5;
    // Si stars viene del JSON, usarlo directamente; sino calcular desde rating
    const stars =
      r.stars !== undefined && r.stars !== null ? r.stars : Math.round(rating);
    const reviews = r.reviews ?? r.staticReviews ?? 0;
    const bookings = r.bookings ?? r.staticBookings ?? 0;
    const price = r.price || r.staticPrices || "$$";
    const cuisine = r.cuisine || "International";
    const tags = r.tags || generateTags(cuisine, index);

    return {
      id: r.id || `gen-${index + 1}`,
      name: normalizedName,
      image: normalizedImage,
      cuisine,
      area: r.area || "Downtown",
      reviews,
      rating,
      stars,
      price,
      bookings,
      tags,
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
  return dynamicRestaurants;
}

/**
 * Initialize restaurants from server using seeded selection
 */
export async function initializeRestaurants(seedOverride?: number | null): Promise<RestaurantGenerated[]> {
  // V2 rule: seed always comes from URL, but if V2 is disabled we force seed=1.
  const effectiveSeed = isV2Enabled()
    ? clampSeed(seedOverride ?? getSeedFromUrl())
    : 1;

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

    console.warn(`[autodining] No restaurants returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[autodining] Backend unavailable, Error:", error);
  }
  return dynamicRestaurants;
}
