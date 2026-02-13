/**
 * V2 Data Loading System for web_4_autodining
 *
 * Loads different data subsets based on v2 seed.
 */

import type { RestaurantGenerated } from '@/data/restaurants-enhanced';
import { initializeRestaurants } from '@/data/restaurants-enhanced';
import { clampBaseSeed } from '@/shared/seed-resolver';
import { isV2Enabled } from "@/dynamic/shared/flags";

const BASE_SEED_STORAGE_KEY = "autodining_seed_base";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private restaurants: RestaurantGenerated[] = [];
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.isEnabled = isV2Enabled();
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadRestaurants();

    if (typeof window !== "undefined") {
      window.addEventListener("autodining:v2SeedChange", (event) => {
        const detail = (event as CustomEvent<{ seed: number | null }>).detail;
        this.reload(detail?.seed ?? null);
      });
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getBaseSeed(): number {
    if (typeof window === "undefined") {
      return clampBaseSeed(1);
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("seed");
      if (raw) {
        const parsed = clampBaseSeed(Number.parseInt(raw, 10));
        window.localStorage.setItem(BASE_SEED_STORAGE_KEY, parsed.toString());
        return parsed;
      }
      const stored = window.localStorage.getItem(BASE_SEED_STORAGE_KEY);
      if (stored) {
        return clampBaseSeed(Number.parseInt(stored, 10));
      }
    } catch (error) {
      console.warn("[autodining] Failed to resolve base seed from URL/localStorage", error);
    }
    return clampBaseSeed(1);
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as any).__autodiningV2Seed;
    if (typeof value === "number" && Number.isFinite(value)) {
      return clampBaseSeed(value);
    }
    return null;
  }

  private async loadRestaurants(): Promise<void> {
    try {
      const baseSeed = this.getBaseSeed();
      const v2Seed = this.getRuntimeV2Seed();
      const effectiveSeed = clampBaseSeed(v2Seed ?? baseSeed);
      this.currentSeed = effectiveSeed;
      this.restaurants = await initializeRestaurants(effectiveSeed);
    } catch (error) {
      console.error("[autodining] Failed to initialize restaurants", error);
      throw error;
    } finally {
      this.ready = true;
    }
  }

  private async reloadIfSeedChanged(): Promise<void> {
    const newSeed = this.getBaseSeed();
    if (newSeed !== this.currentSeed) {
      console.log(`[autodining] Seed changed from ${this.currentSeed} to ${newSeed}, reloading restaurants...`);
      this.currentSeed = newSeed;
      this.ready = false;

      // If already loading, wait for it
      if (this.loadingPromise) {
        await this.loadingPromise;
        return;
      }

      // Start new load
      this.loadingPromise = (async () => {
        try {
          this.restaurants = await initializeRestaurants();
          this.ready = true;
        } catch (error) {
          console.error("[autodining] Failed to reload restaurants", error);
          this.ready = true; // Mark as ready even on error to prevent blocking
        } finally {
          this.loadingPromise = null;
        }
      })();

      await this.loadingPromise;
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (typeof window === "undefined") return;

    const runtimeSeed = seedValue !== undefined && seedValue !== null
      ? seedValue
      : this.getRuntimeV2Seed();
    const targetSeed = runtimeSeed !== null ? clampBaseSeed(runtimeSeed) : this.getBaseSeed();

    if (targetSeed === this.currentSeed && this.ready) {
      return; // Already loaded with this seed
    }

    console.log(`[autodining] Reloading restaurants for base seed=${targetSeed}...`);
    this.currentSeed = targetSeed;
    this.ready = false;

    // If already loading, wait for it
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    // Start new load (initializeRestaurants will derive the V2 seed from the URL)
    this.loadingPromise = (async () => {
      try {
        this.restaurants = await initializeRestaurants();
        this.ready = true;
        console.log(`[autodining] Restaurants reloaded: ${this.restaurants.length} restaurants`);
      } catch (error) {
        console.error("[autodining] Failed to reload restaurants", error);
        this.ready = true; // Mark as ready even on error to prevent blocking
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  public getRestaurants(): RestaurantGenerated[] {
    // Trigger reload if seed changed
    if (typeof window !== "undefined") {
      this.reloadIfSeedChanged().catch((error) => {
        console.error("[autodining] Failed to check/reload on seed change:", error);
      });
    }
    return this.restaurants;
  }

  public getRestaurantById(id: string): RestaurantGenerated | undefined {
    if (!Array.isArray(this.restaurants)) {
      console.log("[autodining] getRestaurantById: restaurants array is not valid");
      return undefined;
    }

    // Ensure id is a string
    const searchId = String(id || '');
    if (!searchId) {
      console.log("[autodining] getRestaurantById: invalid id provided");
      return undefined;
    }

    // Try exact match first
    let found = this.restaurants.find((restaurant) => {
      const restaurantId = String(restaurant.id || '');
      return restaurantId === searchId;
    });

    // If not found, try with URL decoding (in case ID was encoded)
    if (!found) {
      try {
        const decodedId = decodeURIComponent(searchId);
        found = this.restaurants.find((restaurant) => {
          const restaurantId = String(restaurant.id || '');
          return restaurantId === decodedId;
        });
      } catch (e) {
        // Ignore decode errors
      }
    }

    // If still not found, try matching without 'restaurant-' prefix
    if (!found) {
      const idWithoutPrefix = searchId.replace(/^restaurant-/, '');
      found = this.restaurants.find((restaurant) => {
        const restaurantId = String(restaurant.id || '');
        const restaurantIdWithoutPrefix = restaurantId.replace(/^restaurant-/, '');
        return restaurantIdWithoutPrefix === idWithoutPrefix || restaurantId === idWithoutPrefix;
      });
    }

    return found;
  }

  public getRestaurantsByCuisine(cuisine: string): RestaurantGenerated[] {
    if (!Array.isArray(this.restaurants)) {
      return [];
    }
    return this.restaurants.filter((restaurant) => restaurant.cuisine === cuisine);
  }

  public getFeaturedRestaurants(count = 6): RestaurantGenerated[] {
    if (!Array.isArray(this.restaurants)) {
      return [];
    }
    return this.restaurants.slice(0, count);
  }

  public searchRestaurants(query: string): RestaurantGenerated[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return this.restaurants;

    return this.restaurants.filter((restaurant) =>
      [
        restaurant.name,
        restaurant.cuisine,
        restaurant.area,
      ]
        .filter(Boolean)
        .some((value) => value?.toString().toLowerCase().includes(trimmed))
    );
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const getRestaurantsFromProvider = () => dynamicDataProvider.getRestaurants();
export const getRestaurantById = (id: string) => dynamicDataProvider.getRestaurantById(id);
export const getRestaurantsByCuisine = (cuisine: string) => dynamicDataProvider.getRestaurantsByCuisine(cuisine);
export const getFeaturedRestaurants = (count?: number) => dynamicDataProvider.getFeaturedRestaurants(count);
export const searchRestaurants = (query: string) => dynamicDataProvider.searchRestaurants(query);
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();

// Re-export for compatibility
export { initializeRestaurants, getRestaurants } from '@/data/restaurants-enhanced';
export type { RestaurantGenerated } from '@/data/restaurants-enhanced';
