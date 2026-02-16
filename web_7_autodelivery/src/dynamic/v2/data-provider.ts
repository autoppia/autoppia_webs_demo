/**
 * V2 Data Loading System for web_7_autodelivery
 *
 * Loads different data subsets based on v2 seed.
 */

import type { Restaurant } from "@/data/restaurants";
import type { Testimonial } from "@/data/testimonials";
import { initializeRestaurants, loadRestaurantsFromDb } from "@/data/restaurants-enhanced";
import { getRandomTestimonials } from "@/data/testimonials-enhanced";
import { isV2Enabled } from "@/dynamic/shared/flags";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private restaurants: Restaurant[] = [];
  private testimonials: Testimonial[] = [];
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private restaurantSubscribers: Array<(restaurants: Restaurant[]) => void> = [];
  private testimonialSubscribers: Array<(testimonials: Testimonial[]) => void> = [];
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    // Initialize restaurants
    this.initializeRestaurants();

  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeRestaurants(): Promise<void> {
    const seed = this.getSeed();
    this.currentSeed = seed;

    try {
      const dbRestaurants = await loadRestaurantsFromDb(seed);
      if (dbRestaurants.length > 0) {
          this.setRestaurants(dbRestaurants);
          this.setTestimonials(getRandomTestimonials(5));
          return;
      }

      const initializedRestaurants = await initializeRestaurants(seed);
      this.setRestaurants(initializedRestaurants);
      this.setTestimonials(getRandomTestimonials(5));
    } catch (error) {
      console.warn("[autodelivery/data-provider] Failed to load restaurants:", error);
      try {
        const initializedRestaurants = await initializeRestaurants(seed);
        this.setRestaurants(initializedRestaurants);
        this.setTestimonials(getRandomTestimonials(5));
      } catch {
        this.setRestaurants([]);
        this.ready = true;
        this.resolveReady();
      }
    }
  }

  /**
   * Reload data if seed has changed
   */
  public reloadIfSeedChanged(seed?: number | null): void {
    const runtimeSeed = this.getSeed();
    const seedToUse = seed !== undefined && seed !== null ? seed : runtimeSeed;
    if (seedToUse !== null && seedToUse !== this.currentSeed) {
      console.log(`[autodelivery] Seed changed from ${this.currentSeed} to ${seedToUse}, reloading...`);
      this.reload(seedToUse);
    }
  }

  /**
   * Reload restaurants with a new seed
   */
  public async reload(seedValue?: number | null): Promise<void> {
    // Prevent concurrent reloads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        const v2Seed = isV2Enabled()
          ? clampSeed(seedValue ?? this.getSeed())
          : 1;
        this.currentSeed = v2Seed;

        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });

        const initializedRestaurants = await initializeRestaurants(v2Seed);
        this.setRestaurants(initializedRestaurants);
        this.setTestimonials(getRandomTestimonials(5));
      } catch (error) {
        console.warn("[autodelivery] Failed to reload restaurants:", error);
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  public getRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  public getTestimonials(): Testimonial[] {
    return this.testimonials;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public subscribeRestaurants(
    callback: (data: Restaurant[]) => void
  ): () => void {
    this.restaurantSubscribers.push(callback);
    callback(this.restaurants);
    return () => {
      this.restaurantSubscribers = this.restaurantSubscribers.filter(
        (cb) => cb !== callback
      );
    };
  }

  public subscribeTestimonials(
    callback: (data: Testimonial[]) => void
  ): () => void {
    this.testimonialSubscribers.push(callback);
    callback(this.testimonials);
    return () => {
      this.testimonialSubscribers = this.testimonialSubscribers.filter(
        (cb) => cb !== callback
      );
    };
  }

  private notifyRestaurants(): void {
    this.restaurantSubscribers.forEach((cb) => cb(this.restaurants));
  }

  private notifyTestimonials(): void {
    this.testimonialSubscribers.forEach((cb) => cb(this.testimonials));
  }

  private getSeed(): number {
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return clampSeed(getSeedFromUrl());
  }

  private setRestaurants(nextRestaurants: Restaurant[]): void {
    console.log("[autodelivery/data-provider] setRestaurants called with", nextRestaurants.length, "restaurants");
    this.restaurants = nextRestaurants;
    this.ready = true;
    console.log("[autodelivery/data-provider] Marking as ready, restaurants count:", this.restaurants.length);
    this.resolveReady();
    this.notifyRestaurants();
  }

  private setTestimonials(nextTestimonials: Testimonial[]): void {
    this.testimonials = nextTestimonials;
    this.notifyTestimonials();
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    if (!Array.isArray(this.restaurants)) {
      console.log("[autodelivery] getRestaurantById: restaurants array is not valid");
      return undefined;
    }

    // Ensure id is a string
    const searchId = String(id || '');
    if (!searchId) {
      console.log("[autodelivery] getRestaurantById: invalid id provided");
      return undefined;
    }

    // Try exact match first
    let found = this.restaurants.find((restaurant) => {
      const restaurantId = String(restaurant.id || '');
      return restaurantId === searchId;
    });

    // If not found, try URL decoding
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

    // If still not found, try partial match (for numeric IDs)
    if (!found && /^\d+$/.test(searchId)) {
      found = this.restaurants.find((restaurant) => {
        const restaurantId = String(restaurant.id || '');
        // Try matching numeric part or exact match
        return restaurantId === searchId || restaurantId.endsWith(`-${searchId}`) || restaurantId.includes(searchId);
      });
    }

    // If still not found, try partial matching
    if (!found) {
      found = this.restaurants.find((restaurant) => {
        const restaurantId = String(restaurant.id || '');
        return restaurantId.includes(searchId) || searchId.includes(restaurantId);
      });
    }

    // Log for debugging if not found
    if (!found && this.restaurants.length > 0) {
      console.log(`[autodelivery] Restaurant ${searchId} not found. Available restaurants (${this.restaurants.length}):`,
        this.restaurants.slice(0, 5).map(r => ({ id: r.id, name: r.name }))
      );
    }

    return found;
  }

  public getRestaurantsByCuisine(cuisine: string): Restaurant[] {
    return this.restaurants.filter(
      (restaurant) => restaurant.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  public getFeaturedRestaurants(): Restaurant[] {
    return this.restaurants.filter((r) => r.featured).slice(0, 4);
  }

  public searchRestaurants(query: string): Restaurant[] {
    if (!query.trim()) {
      return this.restaurants;
    }
    const normalized = query.toLowerCase();
    return this.restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(normalized) ||
        restaurant.cuisine.toLowerCase().includes(normalized) ||
        restaurant.description.toLowerCase().includes(normalized)
    );
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Re-export for compatibility
export { initializeRestaurants };
