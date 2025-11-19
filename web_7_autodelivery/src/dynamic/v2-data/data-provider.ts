/**
 * V2 Data Loading System for web_7_autodelivery
 *
 * Loads different data subsets based on v2 seed.
 */

import { initializeRestaurants } from "@/data/restaurants-enhanced";
import { getRandomTestimonials } from "@/data/testimonials-enhanced";
import { getEffectiveLayoutConfig } from "@/dynamic/v1-layouts";
import type { Restaurant } from "@/data/restaurants";
import type { Testimonial } from "@/data/testimonials";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;
  private restaurants: Restaurant[] = [];
  private testimonials: Testimonial[] = [];
  private restaurantSubscribers: Array<(restaurants: Restaurant[]) => void> =
    [];
  private testimonialSubscribers: Array<(testimonials: Testimonial[]) => void> =
    [];

  private constructor() {
    // Check if V2 dynamic is enabled - simplified check
    this.isEnabled = false; // Default to false, will be enabled by environment
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadData();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async loadData(seed?: number): Promise<void> {
    if (!this.isEnabled) {
      this.ready = true;
      return;
    }

    try {
      // Use provided seed or default to 1
      const v2Seed = seed ?? 1;
      this.restaurants = await initializeRestaurants(v2Seed);
      this.testimonials = getRandomTestimonials(5);
      this.notifyRestaurants();
      this.notifyTestimonials();
      this.ready = true;
    } catch (error) {
      console.error("[DynamicDataProvider] Failed to load data:", error);
      this.ready = true;
    }
  }

  public async reload(seed?: number): Promise<void> {
    await this.loadData(seed);
  }

  public getTestimonials() {
    if (!this.testimonials.length) {
      this.testimonials = getRandomTestimonials(5);
    }
    return this.testimonials;
  }

  public getRestaurants(): Restaurant[] {
    return this.restaurants;
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

  private notifyRestaurants() {
    this.restaurantSubscribers.forEach((cb) => cb(this.restaurants));
  }

  private notifyTestimonials() {
    this.testimonialSubscribers.forEach((cb) => cb(this.testimonials));
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurants.find((restaurant) => restaurant.id === id);
  }

  public getRestaurantsByCuisine(cuisine: string): Restaurant[] {
    return this.restaurants.filter(
      (restaurant) => restaurant.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  public getFeaturedRestaurants(): Restaurant[] {
    return this.restaurants.slice(0, 4);
  }

  public searchRestaurants(query: string): Restaurant[] {
    if (!query.trim()) {
      return this.restaurants;
    }
    const normalized = query.toLowerCase();
    return this.restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(normalized) ||
        restaurant.cuisine.toLowerCase().includes(normalized)
    );
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Re-export for compatibility
export { initializeRestaurants };
export const getTestimonials = () => dynamicDataProvider.getTestimonials();
export const getRestaurants = () => dynamicDataProvider.getRestaurants();

// Export helper functions
export const isDynamicModeEnabled = () => dynamicDataProvider.isReady();
export const getLayoutConfig = (seed?: number) => {
  return getEffectiveLayoutConfig(seed);
};
