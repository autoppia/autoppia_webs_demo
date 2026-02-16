/**
 * V2 Data Loading System for web_8_autolodge
 * When V2 is enabled, loads data from server endpoint /datasets/load based on seed.
 * When V2 is disabled, falls back to local JSON data.
 */

import type { Hotel } from "@/types/hotel";
import { initializeHotels } from "@/data/hotels-enhanced";
import { clampBaseSeed } from "@/shared/seed-resolver";

const STORAGE_KEY = "autolodge_seed_base";

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
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    if (typeof window === "undefined") {
      this.ready = true;
      this.resolveReady();
      return;
    }
    this.initializeHotels();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getBaseSeed(): number {
    if (typeof window === "undefined") return clampBaseSeed(1);
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("seed");
      if (raw) {
        const parsed = clampBaseSeed(Number.parseInt(raw, 10));
        localStorage.setItem(STORAGE_KEY, parsed.toString());
        return parsed;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return clampBaseSeed(Number.parseInt(stored, 10));
    } catch {
      // ignore
    }
    return clampBaseSeed(1);
  }

  private async initializeHotels(): Promise<void> {
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    try {
      const effectiveSeed = this.getBaseSeed();
      this.currentSeed = effectiveSeed;
      const initializedHotels = await initializeHotels(effectiveSeed);
      this.setHotels(initializedHotels);
    } catch (error) {
      console.error("[autolodge/data-provider] Failed to initialize hotels:", error);
      this.ready = true;
      this.resolveReady();
    }
  }

  public reloadIfSeedChanged(seed?: number | null): void {
    const targetSeed = seed !== undefined && seed !== null ? seed : this.getBaseSeed();
    if (targetSeed !== this.currentSeed) {
      this.reload(targetSeed);
    }
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (typeof window === "undefined") return;
    const targetSeed = clampBaseSeed(seedValue ?? this.getBaseSeed());
    if (targetSeed === this.currentSeed && this.ready) return;
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }
    this.currentSeed = targetSeed;
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.loadingPromise = (async () => {
      try {
        const initializedHotels = await initializeHotels(targetSeed);
        this.setHotels(initializedHotels);
      } catch (error) {
        console.error("[autolodge] Failed to reload hotels:", error);
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    await this.loadingPromise;
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

  public subscribeHotels(callback: (data: Hotel[]) => void): () => void {
    this.hotelSubscribers.push(callback);
    callback(this.hotels);
    return () => {
      this.hotelSubscribers = this.hotelSubscribers.filter((cb) => cb !== callback);
    };
  }

  private setHotels(nextHotels: Hotel[]): void {
    this.hotels = nextHotels;
    this.ready = true;
    this.resolveReady();
    this.hotelSubscribers.forEach((cb) => cb(this.hotels));
  }

  public getHotelById(id: number | string): Hotel | undefined {
    if (!Array.isArray(this.hotels) || this.hotels.length === 0) return undefined;
    const searchIdNum = typeof id === "number" ? id : Number.parseInt(String(id || ""), 10);
    const searchIdStr = String(id || "");
    const isValidNum = Number.isFinite(searchIdNum);

    if (isValidNum) {
      const found = this.hotels.find((hotel) => {
        const hotelId = typeof hotel.id === "number" ? hotel.id : Number.parseInt(String(hotel.id || ""), 10);
        return Number.isFinite(hotelId) && hotelId === searchIdNum;
      });
      if (found) return found;
    }

    return this.hotels.find((hotel) => String(hotel.id || "") === searchIdStr);
  }

  public getFeaturedHotels(count = 6): Hotel[] {
    return this.hotels.slice(0, count);
  }

  public findRelatedHotels(hotelId: number, limit = 4): Hotel[] {
    const current = this.getHotelById(hotelId);
    const pool = this.hotels.filter((hotel) => {
      const hid = typeof hotel.id === "number" ? hotel.id : Number.parseInt(String(hotel.id || ""), 10);
      return Number.isFinite(hid) && hid !== hotelId;
    });
    if (current?.location) {
      const [, country] = current.location.split(",").map((p) => p.trim());
      const sameRegion = pool.filter((h) => h.location.includes(country ?? ""));
      if (sameRegion.length >= limit) return sameRegion.slice(0, limit);
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
      const matchesRegion = !filters?.region || hotel.location.toLowerCase().includes(filters.region.toLowerCase());
      const matchesRating = !filters?.minRating || hotel.rating >= filters.minRating;
      return matchesQuery && matchesRegion && matchesRating;
    });
  }

  public getAvailableRegions(): string[] {
    const regions = new Set<string>();
    this.hotels.forEach((hotel) => {
      const [, country] = hotel.location.split(",").map((p) => p.trim());
      if (country) regions.add(country);
    });
    return Array.from(regions).sort((a, b) => a.localeCompare(b));
  }

  public isDynamicModeEnabled(): boolean {
    return false;
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
