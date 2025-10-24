import type { Restaurant } from "@/data/restaurants";
import { getEffectiveSeed, isDynamicEnabled, getSeedLayout } from "@/lib/seed-layout";
import {
  restaurants,
  initializeRestaurants,
  loadRestaurantsFromDb,
  writeCachedRestaurants,
  readCachedRestaurants,
} from "@/data/restaurants-enhanced";
import { isDataGenerationEnabled } from "@/shared/data-generator";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that returns either seed data or default data based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private restaurants: Restaurant[] = [];
  private isEnabled: boolean = false;
  private dataGenerationEnabled: boolean = false;
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    this.dataGenerationEnabled = isDataGenerationEnabled();
    // hydrate from cache if available to keep content stable across reloads
    const cached = readCachedRestaurants();
    this.restaurants = Array.isArray(cached) && cached.length > 0 ? cached : restaurants;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });

    // Initialize restaurants with data generation if enabled
    this.initializeRestaurants();
  }

  private async initializeRestaurants(): Promise<void> {
    try {
      // Try DB mode first if enabled
      const dbRestaurants = await loadRestaurantsFromDb();
      console.log("🔍 DB restaurants loaded:", dbRestaurants.length, "items");
      if (dbRestaurants.length > 0) {
        this.restaurants = dbRestaurants;
        writeCachedRestaurants(this.restaurants);
        this.ready = true;
        this.resolveReady();
        console.log("✅ DB mode: Data loaded successfully, marking as ready");
        return;
      }

      // If DB mode is enabled but no data found, use static data as fallback
      if (this.dataGenerationEnabled) {
        // Fallback to existing behavior for data generation mode
        const initializedRestaurants = await initializeRestaurants();
        this.restaurants = initializedRestaurants;
        if (this.restaurants.length > 0) {
          writeCachedRestaurants(this.restaurants);
        }

        // Mark as ready only when we have generated data
        if (this.restaurants.length > 0) {
          this.ready = true;
          this.resolveReady();
        }
      } else {
        // For DB mode, use static data as fallback if no DB data found
        this.restaurants = restaurants;
        this.ready = true;
        this.resolveReady();
      }
    } catch (error) {
      console.error("Failed to initialize restaurants:", error);
      // Use static data as fallback
      this.restaurants = restaurants;
      this.ready = true;
      this.resolveReady();
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getRestaurants(): Restaurant[] {
    return this.restaurants || []; // Return empty array if restaurants is undefined
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

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get effective seed value - returns 6 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 6 if invalid
  public getEffectiveSeed(providedSeed: number = 6): number {
    if (!this.isEnabled) {
      return 6; // Default to seed 6 (layout 7)
    }
    
    // Validate seed range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 6; // Default to seed 6 (layout 7)
    }
    
    return providedSeed;
  }

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    return getSeedLayout(seed || 6);
  }

  // Get seed from URL parameter
  public getSeedFromUrl(): number {
    if (typeof window === 'undefined') return 6;
    
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    const rawSeed = seedParam ? parseInt(seedParam, 10) : 6;
    
    return this.getEffectiveSeed(rawSeed);
  }

  // Generate dynamic element attributes based on seed
  public generateElementAttributes(elementType: string, seed: number, index: number = 0): Record<string, string> {
    if (!this.isEnabled) {
      return {
        id: `${elementType}-${index}`,
        'data-element-type': elementType,
      };
    }
    
    return {
      id: `${elementType}-${seed}-${index}`,
      'data-seed': seed.toString(),
      'data-variant': (seed % 10).toString(),
      'data-element-type': elementType,
      'data-layout-id': getSeedLayout(seed).layoutId.toString(),
    };
  }

  // Generate XPath selector based on seed
  public generateXPath(elementType: string, seed: number): string {
    if (!this.isEnabled) {
      return `//${elementType}`;
    }
    return `//${elementType}[@data-seed='${seed}']`;
  }

  // Reorder array elements based on seed
  public reorderElements<T extends { id?: string | number; name?: string }>(elements: T[], seed: number): T[] {
    if (!this.isEnabled) {
      return elements;
    }
    
    // Simple reordering based on seed
    const reordered = [...elements];
    const shifts = seed % elements.length;
    
    for (let i = 0; i < shifts; i++) {
      const first = reordered.shift();
      if (first) {
        reordered.push(first);
      }
    }
    
    return reordered;
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const getRestaurants = () => dynamicDataProvider.getRestaurants();
export const getRestaurantById = (id: string) => dynamicDataProvider.getRestaurantById(id);
export const getRestaurantsByCuisine = (cuisine: string) => dynamicDataProvider.getRestaurantsByCuisine(cuisine);
export const getFeaturedRestaurants = () => dynamicDataProvider.getFeaturedRestaurants();
export const searchRestaurants = (query: string) => dynamicDataProvider.searchRestaurants(query);
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeedValue = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);
export const getSeedFromUrl = () => dynamicDataProvider.getSeedFromUrl();
export const generateElementAttrs = (elementType: string, seed: number, index?: number) => 
  dynamicDataProvider.generateElementAttributes(elementType, seed, index);
export const generateXPathSelector = (elementType: string, seed: number) => 
  dynamicDataProvider.generateXPath(elementType, seed);
export const reorderBySeed = <T extends { id?: string | number; name?: string }>(elements: T[], seed: number) => 
  dynamicDataProvider.reorderElements(elements, seed);

