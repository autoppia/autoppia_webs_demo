/**
 * V2 Data Loading System for web_8_autolodge
 *
 * Loads different data subsets based on v2 seed.
 */

import type { Hotel } from "@/types/hotel";
import { initializeHotels, loadHotelsFromDb } from "@/data/hotels-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

export interface HotelSearchFilters {
  region?: string;
  minRating?: number;
}

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private hotels: Hotel[] = [];
  private ready: boolean = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private hotelSubscribers: Array<(hotels: Hotel[]) => void> = [];
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    // Initialize hotels
    this.initializeHotels();

    if (typeof window !== "undefined") {
      window.addEventListener("autolodge:v2SeedChange", (event) => {
        const detail = (event as CustomEvent<{ seed: number | null }>).detail;
        this.reloadIfSeedChanged(detail?.seed ?? null);
      });
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async initializeHotels(): Promise<void> {
    // Reset ready state when initializing (in case of seed change)
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    const baseSeed = this.getBaseSeedFromUrl();
    const runtimeSeed = this.getRuntimeV2Seed();
    
    try {
      // If base seed = 1, use fallback data directly (skip DB/AI)
      if (baseSeed === 1) {
        console.log("[autolodge/data-provider] Base seed is 1, using fallback data");
        const initializedHotels = await initializeHotels(runtimeSeed ?? undefined);
        this.setHotels(initializedHotels);
        return;
      }
      
      this.currentSeed = runtimeSeed ?? 1;
      
      // Check if DB mode is enabled - only try DB if enabled
      const dbModeEnabled = isDbLoadModeEnabled();
      console.log("[autolodge/data-provider] DB mode enabled:", dbModeEnabled, "runtimeSeed:", runtimeSeed, "baseSeed:", baseSeed);
      
      if (dbModeEnabled) {
        // Try DB mode first if enabled
        console.log("[autolodge/data-provider] Attempting to load hotels from DB...");
        const dbHotels = await loadHotelsFromDb(runtimeSeed ?? undefined);
        console.log("[autolodge/data-provider] loadHotelsFromDb returned:", dbHotels.length, "hotels");
        
        if (dbHotels.length > 0) {
          console.log("[autolodge/data-provider] ✅ Successfully loaded", dbHotels.length, "hotels from DB");
          this.setHotels(dbHotels);
          return;
        } else {
          console.log("[autolodge/data-provider] ⚠️ No hotels from DB, will try initializeHotels...");
        }
      }
      
      // If DB mode not enabled or DB returned empty, use initializeHotels
      // This will handle fallback data loading
      const initializedHotels = await initializeHotels(runtimeSeed ?? undefined);
      this.setHotels(initializedHotels);

    } catch (error) {
      console.error("[autolodge/data-provider] Failed to initialize hotels:", error);
      // Even if there's an error, we should mark as ready with fallback data
      // to prevent infinite loading state
      try {
        const initializedHotels = await initializeHotels(runtimeSeed ?? undefined);
        this.setHotels(initializedHotels);
      } catch (fallbackError) {
        console.error("[autolodge/data-provider] Failed to initialize fallback hotels:", fallbackError);
        // Last resort: mark as ready with empty array to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      }
    }
  }
  
  /**
   * Reload data if seed has changed
   */
  public reloadIfSeedChanged(seed?: number | null): void {
    const runtimeSeed = this.getRuntimeV2Seed();
    const seedToUse = seed !== undefined && seed !== null ? seed : runtimeSeed;
    if (seedToUse !== null && seedToUse !== this.currentSeed) {
      console.log(`[autolodge] Seed changed from ${this.currentSeed} to ${seedToUse}, reloading...`);
      this.reload(seedToUse);
    }
  }
  
  /**
   * Reload hotels with a new seed
   */
  public async reload(seedValue?: number | null): Promise<void> {
    // Prevent concurrent reloads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = (async () => {
      try {
        const baseSeed = this.getBaseSeedFromUrl();
        const v2Seed = seedValue ?? this.getRuntimeV2Seed() ?? 1;
        
        // If base seed = 1, use fallback data directly (skip DB/AI)
        if (baseSeed === 1) {
          console.log("[autolodge/data-provider] Reload: Base seed is 1, using fallback data");
          this.currentSeed = 1;
        } else {
          this.currentSeed = v2Seed;
        }
        
        // Reset ready state
        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });
        
        const initializedHotels = await initializeHotels(v2Seed);
        this.setHotels(initializedHotels);
      } catch (error) {
        console.error("[autolodge] Failed to reload hotels:", error);
        // Mark as ready even on error to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    
    return this.loadingPromise;
  }

  public getHotels(): Hotel[] {
    return this.hotels;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public subscribeHotels(
    callback: (data: Hotel[]) => void
  ): () => void {
    this.hotelSubscribers.push(callback);
    callback(this.hotels);
    return () => {
      this.hotelSubscribers = this.hotelSubscribers.filter(
        (cb) => cb !== callback
      );
    };
  }

  private notifyHotels(): void {
    this.hotelSubscribers.forEach((cb) => cb(this.hotels));
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const extendedWindow = window as Window & {
      __autolodgeV2Seed?: number | null;
    };
    const value = extendedWindow.__autolodgeV2Seed;
    if (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 300
    ) {
      return value;
    }
    return null;
  }

  private getBaseSeedFromUrl(): number | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get("seed");
    if (seedParam) {
      const parsed = Number.parseInt(seedParam, 10);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 300) {
        return parsed;
      }
    }
    return null;
  }

  private setHotels(nextHotels: Hotel[]): void {
    console.log("[autolodge/data-provider] setHotels called with", nextHotels.length, "hotels");
    this.hotels = nextHotels;
    this.ready = true;
    console.log("[autolodge/data-provider] Marking as ready, hotels count:", this.hotels.length);
    this.resolveReady();
    this.notifyHotels();
  }

  public getHotelById(id: number | string): Hotel | undefined {
    if (!Array.isArray(this.hotels)) {
      console.log("[autolodge] getHotelById: hotels array is not valid");
      return undefined;
    }
    
    if (this.hotels.length === 0) {
      console.log("[autolodge] getHotelById: hotels array is empty");
      return undefined;
    }
    
    // Normalize search ID - try both number and string
    const searchIdNum = typeof id === 'number' ? id : Number.parseInt(String(id || ''), 10);
    const searchIdStr = String(id || '');
    const isValidNum = Number.isFinite(searchIdNum);
    
    console.log(`[autolodge] getHotelById: searching for id="${id}" (type: ${typeof id}), normalized: num=${searchIdNum}, str="${searchIdStr}", validNum=${isValidNum}`);
    
    // Try multiple matching strategies
    let found: Hotel | undefined = undefined;
    
    // Strategy 1: Direct numeric match
    if (isValidNum) {
      found = this.hotels.find((hotel) => {
        const hotelId = typeof hotel.id === 'number' ? hotel.id : Number.parseInt(String(hotel.id || ''), 10);
        if (Number.isFinite(hotelId) && hotelId === searchIdNum) {
          return true;
        }
        return false;
      });
      
      if (found) {
        console.log(`[autolodge] getHotelById: ✅ Found via numeric match (${searchIdNum})`);
        return found;
      }
    }
    
    // Strategy 2: String exact match
    found = this.hotels.find((hotel) => {
      const hotelIdStr = String(hotel.id || '');
      if (hotelIdStr === searchIdStr) {
        return true;
      }
      // Also try matching against the original search id as string
      if (hotelIdStr === String(id)) {
        return true;
      }
      return false;
    });
    
    if (found) {
      console.log(`[autolodge] getHotelById: ✅ Found via string match ("${searchIdStr}")`);
      return found;
    }
    
    // Strategy 3: Convert hotel IDs to string and match
    if (isValidNum) {
      found = this.hotels.find((hotel) => {
        const hotelIdNum = typeof hotel.id === 'number' ? hotel.id : Number.parseInt(String(hotel.id || ''), 10);
        if (Number.isFinite(hotelIdNum)) {
          const hotelIdStr = String(hotelIdNum);
          const searchIdStrFromNum = String(searchIdNum);
          if (hotelIdStr === searchIdStrFromNum || hotelIdStr === searchIdStr) {
            return true;
          }
        }
        return false;
      });
      
      if (found) {
        console.log(`[autolodge] getHotelById: ✅ Found via string conversion match`);
        return found;
      }
    }
    
    // Log for debugging if not found
    if (!found && this.hotels.length > 0) {
      console.log(`[autolodge] getHotelById: ❌ Hotel not found after all strategies`);
      console.log(`[autolodge] Searched for:`, { 
        original: id, 
        numeric: searchIdNum, 
        string: searchIdStr,
        isValidNum 
      });
      console.log(`[autolodge] Available hotels (first 10):`,
        this.hotels.slice(0, 10).map(h => ({ 
          id: h.id, 
          idType: typeof h.id,
          idString: String(h.id),
          idNumber: typeof h.id === 'number' ? h.id : Number(h.id),
          title: h.title
        }))
      );
    }
    
    return found;
  }

  public getFeaturedHotels(count = 6): Hotel[] {
    return this.hotels.slice(0, count);
  }

  public findRelatedHotels(hotelId: number, limit = 4): Hotel[] {
    const current = this.getHotelById(hotelId);
    const pool = this.hotels.filter((hotel) => {
      const id = typeof hotel.id === 'number' ? hotel.id : Number.parseInt(String(hotel.id || ''), 10);
      return Number.isFinite(id) && id !== hotelId;
    });

    if (current && current.location) {
      const [, country] = current.location.split(",").map((part) => part.trim());
      const sameRegion = pool.filter((hotel) => hotel.location.includes(country ?? ""));
      if (sameRegion.length >= limit) {
        return sameRegion.slice(0, limit);
      }
    }

    return pool.slice(0, limit);
  }

  public searchHotels(query: string, filters?: HotelSearchFilters): Hotel[] {
    const normalizedQuery = query.trim().toLowerCase();
    return this.hotels.filter((hotel) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        hotel.title.toLowerCase().includes(normalizedQuery) ||
        hotel.location.toLowerCase().includes(normalizedQuery);

      const matchesRegion =
        !filters?.region ||
        hotel.location.toLowerCase().includes(filters.region.toLowerCase());
      const matchesRating =
        !filters?.minRating || hotel.rating >= filters.minRating;

      return matchesQuery && matchesRegion && matchesRating;
    });
  }

  public getAvailableRegions(): string[] {
    const regions = new Set<string>();
    this.hotels.forEach((hotel) => {
      const [, country] = hotel.location.split(",").map((part) => part.trim());
      if (country) regions.add(country);
    });
    return Array.from(regions).sort((a, b) => a.localeCompare(b));
  }

  public isDynamicModeEnabled(): boolean {
    return isDbLoadModeEnabled();
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const getHotels = () => dynamicDataProvider.getHotels();
export const getHotelById = (id: number | string) => dynamicDataProvider.getHotelById(id);
export const getFeaturedHotels = (count?: number) => dynamicDataProvider.getFeaturedHotels(count);
export const getRelatedHotels = (hotelId: number, limit?: number) => dynamicDataProvider.findRelatedHotels(hotelId, limit);
export const searchHotels = (query: string, filters?: HotelSearchFilters) => dynamicDataProvider.searchHotels(query, filters);
export const getAvailableRegions = () => dynamicDataProvider.getAvailableRegions();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
