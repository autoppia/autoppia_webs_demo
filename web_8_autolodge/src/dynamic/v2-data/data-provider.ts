import { initializeHotels } from "@/data/hotels-enhanced";
import { DASHBOARD_HOTELS } from "@/library/dataset";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { clampBaseSeed } from "@/shared/seed-resolver";
import type { Hotel } from "@/types/hotel";

export interface HotelSearchFilters {
  region?: string;
  minRating?: number;
}

const BASE_SEED_STORAGE_KEY = "autolodge_seed_base";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private hotels: Hotel[] = [...DASHBOARD_HOTELS];
  private ready = false;
  private readyPromise: Promise<void>;

  private constructor() {
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }

    this.readyPromise = this.loadHotels();
    window.addEventListener("autolodge:v2SeedChange", this.handleSeedChange);
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getBaseSeed(): number {
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
      console.warn("[autolodge] Failed to resolve base seed from URL/localStorage", error);
    }
    return clampBaseSeed(1);
  }

  private handleSeedChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ seed: number | null }>;
    const nextSeed = customEvent.detail?.seed ?? null;
    if (nextSeed) {
      this.loadHotels(nextSeed).catch((error) =>
        console.warn("[autolodge] Failed to reload hotels for v2 seed change", error)
      );
    }
  };

  private async loadHotels(seed?: number | null): Promise<void> {
    try {
      const resolvedSeed = seed ?? this.getBaseSeed();
      const loadedHotels = await initializeHotels(resolvedSeed);
      this.hotels = Array.isArray(loadedHotels) ? loadedHotels : [];
    } catch (error) {
      console.error("[autolodge] Failed to initialize hotels", error);
      this.hotels = [...DASHBOARD_HOTELS];
    } finally {
      this.ready = true;
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getHotels(): Hotel[] {
    return Array.isArray(this.hotels) ? this.hotels : [];
  }

  public getHotelById(id: number): Hotel | undefined {
    return this.getHotels().find((hotel) => hotel.id === id);
  }

  public getFeaturedHotels(count = 6): Hotel[] {
    return this.getHotels().slice(0, count);
  }

  public findRelatedHotels(hotelId: number, limit = 4): Hotel[] {
    const current = this.getHotelById(hotelId);
    const pool = this.getHotels().filter((hotel) => hotel.id !== hotelId);

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
    return this.getHotels().filter((hotel) => {
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
    this.getHotels().forEach((hotel) => {
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
export const getHotelById = (id: number) => dynamicDataProvider.getHotelById(id);
export const getFeaturedHotels = (count?: number) => dynamicDataProvider.getFeaturedHotels(count);
export const getRelatedHotels = (hotelId: number, limit?: number) => dynamicDataProvider.findRelatedHotels(hotelId, limit);
export const searchHotels = (query: string, filters?: HotelSearchFilters) => dynamicDataProvider.searchHotels(query, filters);
export const getAvailableRegions = () => dynamicDataProvider.getAvailableRegions();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
