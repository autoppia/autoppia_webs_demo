/**
 * Enhanced Restaurants Data with AI Generation Support
 *
 * This file provides both static and dynamic restaurant data generation
 * for the Food Delivery application.
 */

import type { Restaurant } from "@/data/restaurants";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

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

const resolveSeed = (seedValue?: number | null): number => {
  // V2 rule: seed always comes from URL, but if V2 is disabled we force seed=1.
  return isV2Enabled()
    ? clampSeed(seedValue ?? getSeedFromUrl())
    : 1;
};

// Dynamic restaurants array
let dynamicRestaurants: Restaurant[] = [];

/**
 * Initialize restaurants with V2 system (DB mode only)
 */
export async function initializeRestaurants(seedOverride?: number | null): Promise<Restaurant[]> {
  const effectiveSeed = resolveSeed(seedOverride);

  try {
    const restaurants = await fetchSeededSelection<Restaurant>({
      projectKey: "web_7_autodelivery",
      entityType: "restaurants",
      seedValue: effectiveSeed,
      limit: 50,
      method: "distribute",
      filterKey: "cuisine",
    });

    if (Array.isArray(restaurants) && restaurants.length > 0) {
      console.log(
        `[autodelivery] Loaded ${restaurants.length} restaurants from dataset (seed=${effectiveSeed})`
      );
      dynamicRestaurants = normalizeRestaurantImages(restaurants);
      return dynamicRestaurants;
    }

    console.warn(`[autodelivery] No restaurants returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[autodelivery] Backend unavailable:", error);
  }

  dynamicRestaurants = [];
  return dynamicRestaurants;
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadRestaurantsFromDb(seedOverride?: number | null): Promise<Restaurant[]> {
  const seed = resolveSeed(seedOverride);

  try {
    const limit = 50;
    const distributed = await fetchSeededSelection<Restaurant>({
      projectKey: "web_7_autodelivery",
      entityType: "restaurants",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "cuisine",
    });
    const selected =
      Array.isArray(distributed) && distributed.length > 0
        ? distributed
        : await fetchSeededSelection<Restaurant>({
            projectKey: "web_7_autodelivery",
            entityType: "restaurants",
            seedValue: seed,
            limit,
            method: "select",
          });
    if (selected && selected.length > 0) {
      return normalizeRestaurantImages(selected);
    }
  } catch (e) {
    console.warn("[autodelivery] loadRestaurantsFromDb: Failed to load from DB:", e);
  }

  return [];
}

// Export the dynamic restaurants array for direct access
export { dynamicRestaurants as restaurants };
