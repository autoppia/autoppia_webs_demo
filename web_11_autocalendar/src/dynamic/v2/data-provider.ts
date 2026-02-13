import type { CalendarEvent } from "@/library/dataset";
import { initializeEvents } from "@/data/events-enhanced";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

export interface EventSearchFilters {
  calendar?: string;
  date?: string;
  label?: string;
}

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private events: CalendarEvent[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady: () => void = () => {};
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;
  
  // Subscribers
  private eventSubscribers: Array<(data: CalendarEvent[]) => void> = [];

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.initialize();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
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

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as any).__autocalendarV2Seed;
    if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
      return value;
    }
    return null;
  }

  private async initialize(): Promise<void> {
    // Reset ready state when initializing (in case of seed change)
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    const baseSeed = this.getBaseSeedFromUrl();
    const runtimeSeed = this.getRuntimeV2Seed();
    
    try {
      // If base seed = 1, use fallback data directly (skip DB mode)
      if (baseSeed === 1) {
        console.log("[autocalendar/data-provider] Base seed is 1, using fallback data");
        const events = await initializeEvents(runtimeSeed ?? undefined);
        this.setEvents(events);
        return;
      }
      
      this.currentSeed = runtimeSeed ?? 1;
      
      // Check if DB mode is enabled - only try DB if enabled
      const dbModeEnabled = isDbLoadModeEnabled();
      console.log("[autocalendar/data-provider] DB mode enabled:", dbModeEnabled, "runtimeSeed:", runtimeSeed, "baseSeed:", baseSeed);
      
      if (dbModeEnabled) {
        // Try DB mode first if enabled
        console.log("[autocalendar/data-provider] Attempting to load from DB...");
        // Let initializeEvents handle DB loading
      }
      
      // Initialize events (handles DB mode internally)
      const events = await initializeEvents(runtimeSeed ?? undefined);
      
      this.setEvents(events);
      
      console.log("[autocalendar/data-provider] ✅ Data initialized:", {
        events: events.length,
      });
    } catch (error) {
      console.error("[autocalendar/data-provider] Failed to initialize data:", error);
      // Even if there's an error, we should mark as ready with fallback data
      // to prevent infinite loading state
      try {
        const events = await initializeEvents(runtimeSeed ?? undefined);
        this.setEvents(events);
      } catch (fallbackError) {
        console.error("[autocalendar/data-provider] Failed to initialize fallback data:", fallbackError);
        // Last resort: mark as ready to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      }
    }
    
    // Listen for seed changes
    if (typeof window !== "undefined") {
      window.addEventListener("autocalendar:v2SeedChange", this.handleSeedEvent.bind(this));
    }
  }

  private handleSeedEvent = () => {
    console.log("[autocalendar/data-provider] Seed change event received");
    this.reload();
  };

  /**
   * Reload data if seed has changed
   */
  public reloadIfSeedChanged(seed?: number | null): void {
    const runtimeSeed = this.getRuntimeV2Seed();
    const seedToUse = seed !== undefined && seed !== null ? seed : runtimeSeed;
    if (seedToUse !== null && seedToUse !== this.currentSeed) {
      console.log(`[autocalendar] Seed changed from ${this.currentSeed} to ${seedToUse}, reloading...`);
      this.reload(seedToUse);
    }
  }

  /**
   * Reload all data with a new seed
   */
  public async reload(seedValue?: number | null): Promise<void> {
    // Prevent concurrent reloads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = (async () => {
      try {
        const baseSeed = this.getBaseSeedFromUrl();
        const runtimeSeed = this.getRuntimeV2Seed();
        const { resolveSeedsSync } = require("@/shared/seed-resolver");
        
        let v2Seed: number | null = null;
        if (seedValue !== undefined && seedValue !== null) {
          v2Seed = seedValue;
        } else if (baseSeed !== null) {
          const resolvedSeeds = resolveSeedsSync(baseSeed);
          v2Seed = resolvedSeeds.v2;
        }
        if (v2Seed === null) {
          v2Seed = runtimeSeed;
        }
        if (v2Seed === null) {
          v2Seed = 1;
        }
        
        // If base seed = 1, use fallback data directly
        if (baseSeed === 1) {
          console.log("[autocalendar/data-provider] Reload: Base seed is 1, using fallback data");
          this.currentSeed = 1;
        } else {
          this.currentSeed = v2Seed;
        }
        
        // Reset ready state
        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });
        
        // CRITICAL: Clear all existing data BEFORE loading new data
        // This ensures no old seed data is preserved
        console.log("[autocalendar/data-provider] Clearing old data before loading new seed data...");
        this.events = [];
        
        // Notify all subscribers with empty arrays to clear UI immediately
        this.notifyEvents();
        
        // Small delay to ensure subscribers have processed the clear
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Now load new data for the new seed
        const events = await initializeEvents(v2Seed);
        
        // Set new data (this will notify subscribers again with new data)
        this.setEvents(events);
        
        console.log("[autocalendar/data-provider] ✅ Data reloaded for seed", v2Seed, ":", {
          events: events.length,
        });
      } catch (error) {
        console.error("[autocalendar] Failed to reload data:", error);
        // Mark as ready even on error to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    
    return this.loadingPromise;
  }

  private setEvents(nextEvents: CalendarEvent[]): void {
    console.log("[autocalendar/data-provider] setEvents called with", nextEvents.length, "events");
    this.events = nextEvents;
    this.notifyEvents();
    this.checkAndResolveReady();
  }

  private checkAndResolveReady(): void {
    // Mark as ready when data is loaded
    if (!this.ready && this.events.length > 0) {
      this.ready = true;
      console.log("[autocalendar/data-provider] Marking as ready");
      this.resolveReady();
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getEvents(): CalendarEvent[] {
    return this.events;
  }

  public getEventById(id: string): CalendarEvent | undefined {
    return this.events.find((event) => event.id === id);
  }

  public getEventsByDate(date: string): CalendarEvent[] {
    return this.events.filter((event) => event.date === date);
  }

  public getEventsByCalendar(calendar: string): CalendarEvent[] {
    return this.events.filter((event) => event.calendar === calendar);
  }

  public searchEvents(query: string, filters?: EventSearchFilters): CalendarEvent[] {
    const normalized = query.trim().toLowerCase();
    let results = this.events;
    
    if (normalized) {
      results = results.filter(
        (event) =>
          event.label.toLowerCase().includes(normalized) ||
          event.description.toLowerCase().includes(normalized) ||
          event.location.toLowerCase().includes(normalized)
      );
    }
    
    if (filters?.calendar) {
      results = results.filter((event) => event.calendar === filters.calendar);
    }
    
    if (filters?.date) {
      results = results.filter((event) => event.date === filters.date);
    }
    
    return results;
  }

  public getAvailableCalendars(): string[] {
    const calendars = new Set<string>();
    this.events.forEach((event) => {
      if (event.calendar) {
        calendars.add(event.calendar);
      }
    });
    return Array.from(calendars).sort((a, b) => a.localeCompare(b));
  }

  public subscribeEvents(callback: (data: CalendarEvent[]) => void): () => void {
    this.eventSubscribers.push(callback);
    callback(this.events);
    return () => {
      this.eventSubscribers = this.eventSubscribers.filter((cb) => cb !== callback);
    };
  }

  private notifyEvents(): void {
    this.eventSubscribers.forEach((cb) => cb(this.events));
  }

  public isDynamicModeEnabled(): boolean {
    const { isDbLoadModeEnabled } = require("@/shared/seeded-loader");
    return isDbLoadModeEnabled();
  }

  public getLayoutConfig(seed?: number) {
    return { seed: clampBaseSeed(seed ?? 1) };
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const whenReady = () => dynamicDataProvider.whenReady();
export const getEvents = () => dynamicDataProvider.getEvents();
export const getEventById = (id: string) => dynamicDataProvider.getEventById(id);
export const getEventsByDate = (date: string) => dynamicDataProvider.getEventsByDate(date);
export const getEventsByCalendar = (calendar: string) => dynamicDataProvider.getEventsByCalendar(calendar);
export const searchEvents = (query: string, filters?: EventSearchFilters) => dynamicDataProvider.searchEvents(query, filters);
export const getAvailableCalendars = () => dynamicDataProvider.getAvailableCalendars();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
