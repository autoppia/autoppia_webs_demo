import type { Restaurant } from "@/data/restaurants";
import type { Testimonial } from "@/data/testimonials";
import {
  initializeRestaurants,
  loadRestaurantsFromDb,
  writeCachedRestaurants,
  readCachedRestaurants,
} from "@/data/restaurants-enhanced";
import {
  initializeTestimonials,
  loadTestimonialsFromDb,
  writeCachedTestimonials,
  readCachedTestimonials,
} from "@/data/testimonials-enhanced";
import { isDataGenerationEnabled } from "@/shared/data-generator";
import { restaurants } from "@/data/restaurants";
import { testimonials } from "@/data/testimonials";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return process.env.ENABLE_DYNAMIC_HTML === 'true' || process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML === 'true';
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private restaurants: Restaurant[] = [];
  private testimonials: Testimonial[] = [];
  private isEnabled: boolean = false;
  private dataGenerationEnabled: boolean = false;
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private restaurantListeners = new Set<(restaurants: Restaurant[]) => void>();
  private testimonialListeners = new Set<(testimonials: Testimonial[]) => void>();

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.dataGenerationEnabled = isDataGenerationEnabled();
    // hydrate from cache if available to keep content stable across reloads
    const cachedRestaurants = readCachedRestaurants();
    const cachedTestimonials = readCachedTestimonials();
    this.restaurants = Array.isArray(cachedRestaurants) && cachedRestaurants.length > 0 ? cachedRestaurants : restaurants;
    this.testimonials = Array.isArray(cachedTestimonials) && cachedTestimonials.length > 0 ? cachedTestimonials : testimonials;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    // Initialize restaurants and testimonials with data generation if enabled
    this.initializeData();
    if (typeof window !== "undefined") {
      window.addEventListener("autodelivery:v2SeedChange", (event) => {
        const detail = (event as CustomEvent<{ seed: number | null }>).detail;
        this.refreshDataForSeed(detail?.seed ?? null);
      });
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeData(): Promise<void> {
    try {
      // Initialize restaurants and testimonials in parallel
      const [initializedRestaurants, initializedTestimonials] = await Promise.all([
        this.initializeRestaurants(),
        this.initializeTestimonials()
      ]);

      this.setRestaurants(initializedRestaurants, false);
      this.setTestimonials(initializedTestimonials, false);
      this.ready = true;
      this.resolveReady();
      console.log("✅ Data initialization complete");
    } catch (error) {
      console.error("Failed to initialize data:", error);
      // Use static data as fallback
      this.setRestaurants(restaurants, false);
      this.setTestimonials(testimonials, false);
      this.ready = true;
      this.resolveReady();
    }
  }

  private async initializeRestaurants(): Promise<Restaurant[]> {
    try {
      const runtimeSeed = this.getRuntimeV2Seed();
      // Try DB mode first if enabled
      const dbRestaurants = await loadRestaurantsFromDb(runtimeSeed ?? undefined);
      if (dbRestaurants.length > 0) {
        console.log("🔍 DB restaurants loaded:", dbRestaurants.length, "items");
        writeCachedRestaurants(dbRestaurants);
        return dbRestaurants;
      }

      // If DB mode is enabled but no data found, use static data as fallback
      if (this.dataGenerationEnabled) {
        // Fallback to existing behavior for data generation mode
        const initializedRestaurants = await initializeRestaurants();
        if (initializedRestaurants.length > 0) {
          writeCachedRestaurants(initializedRestaurants);
        }
        return initializedRestaurants;
      } else {
        // For DB mode, use static data as fallback if no DB data found
        return restaurants;
      }
    } catch (error) {
      console.error("Failed to initialize restaurants:", error);
      return restaurants;
    }
  }

  private async initializeTestimonials(): Promise<Testimonial[]> {
    try {
      const runtimeSeed = this.getRuntimeV2Seed();
      // Try DB mode first if enabled
      const dbTestimonials = await loadTestimonialsFromDb(runtimeSeed ?? undefined);
      if (dbTestimonials.length > 0) {
        console.log("🔍 DB testimonials loaded:", dbTestimonials.length, "items");
        writeCachedTestimonials(dbTestimonials);
        return dbTestimonials;
      }

      // If DB mode is enabled but no data found, use static data as fallback
      if (this.dataGenerationEnabled) {
        // Fallback to existing behavior for data generation mode
        const initializedTestimonials = await initializeTestimonials();
        if (initializedTestimonials.length > 0) {
          writeCachedTestimonials(initializedTestimonials);
        }
        return initializedTestimonials;
      } else {
        // For DB mode, use static data as fallback if no DB data found
        return testimonials;
      }
    } catch (error) {
      console.error("Failed to initialize testimonials:", error);
      return testimonials;
    }
  }

  public getRestaurants(): Restaurant[] {
    return this.restaurants || [];
  }

  public subscribeRestaurants(listener: (restaurants: Restaurant[]) => void): () => void {
    this.restaurantListeners.add(listener);
    listener([...this.restaurants]);
    return () => {
      this.restaurantListeners.delete(listener);
    };
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    return (this.restaurants || []).find((restaurant) => restaurant.id === id);
  }

  public getRestaurantsByCuisine(cuisine: string): Restaurant[] {
    return (this.restaurants || []).filter((restaurant) => restaurant.cuisine === cuisine);
  }

  public getFeaturedRestaurants(): Restaurant[] {
    return (this.restaurants || []).filter((restaurant) => restaurant.featured);
  }

  public searchRestaurants(query: string): Restaurant[] {
    const lowercaseQuery = query.toLowerCase();
    return (this.restaurants || []).filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(lowercaseQuery) ||
        restaurant.description?.toLowerCase().includes(lowercaseQuery) ||
        restaurant.cuisine?.toLowerCase().includes(lowercaseQuery)
    );
  }

  public getTestimonials(): Testimonial[] {
    return this.testimonials || [];
  }

  public subscribeTestimonials(listener: (testimonials: Testimonial[]) => void): () => void {
    this.testimonialListeners.add(listener);
    listener([...this.testimonials]);
    return () => {
      this.testimonialListeners.delete(listener);
    };
  }

  public getTestimonialById(id: string): Testimonial | undefined {
    return (this.testimonials || []).find((testimonial) => testimonial.id === id);
  }

  public getRandomTestimonials(count: number = 3): Testimonial[] {
    const testimonials = this.testimonials || [];
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, testimonials.length));
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getLayoutConfig() {
    return { isEnabled: this.isEnabled };
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = window.__autodeliveryV2Seed;
    if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
      return value;
    }
    return null;
  }

  private setRestaurants(restaurants: Restaurant[], notifyCache: boolean = true) {
    this.restaurants = restaurants;
    if (notifyCache) {
      try {
        writeCachedRestaurants(restaurants);
      } catch {
        /* ignore */
      }
    }
    const snapshot = [...this.restaurants];
    this.restaurantListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn("[dynamicDataProvider] restaurant listener error", err);
      }
    });
  }

  private setTestimonials(testimonials: Testimonial[], notifyCache: boolean = true) {
    this.testimonials = testimonials;
    if (notifyCache) {
      try {
        writeCachedTestimonials(testimonials);
      } catch {
        /* ignore */
      }
    }
    const snapshot = [...this.testimonials];
    this.testimonialListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn("[dynamicDataProvider] testimonial listener error", err);
      }
    });
  }

  public async refreshDataForSeed(seedOverride?: number | null): Promise<void> {
    if (!isDbLoadModeEnabled()) {
      return;
    }
    try {
      const runtimeSeed = typeof seedOverride === "number" ? seedOverride : this.getRuntimeV2Seed();
      console.log("[dynamicDataProvider] refreshing data for v2 seed", runtimeSeed);
      const [restaurantsData, testimonialsData] = await Promise.all([
        loadRestaurantsFromDb(runtimeSeed ?? undefined),
        loadTestimonialsFromDb(runtimeSeed ?? undefined),
      ]);
      if (restaurantsData.length > 0) {
        this.setRestaurants(restaurantsData);
      }
      if (testimonialsData.length > 0) {
        this.setTestimonials(testimonialsData);
      }
    } catch (error) {
      console.warn("[dynamicDataProvider] refreshDataForSeed failed", error);
    }
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper exports for easy access
export const getRestaurants = () => dynamicDataProvider.getRestaurants();
export const getRestaurantById = (id: string) => dynamicDataProvider.getRestaurantById(id);
export const getRestaurantsByCuisine = (cuisine: string) => dynamicDataProvider.getRestaurantsByCuisine(cuisine);
export const getFeaturedRestaurants = () => dynamicDataProvider.getFeaturedRestaurants();
export const searchRestaurants = (query: string) => dynamicDataProvider.searchRestaurants(query);
export const getTestimonials = () => dynamicDataProvider.getTestimonials();
export const getTestimonialById = (id: string) => dynamicDataProvider.getTestimonialById(id);
export const getRandomTestimonials = (count: number = 3) => dynamicDataProvider.getRandomTestimonials(count);
export const isDataReady = () => dynamicDataProvider.isReady();
export const whenDataReady = () => dynamicDataProvider.whenReady();