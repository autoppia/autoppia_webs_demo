import type { CalendarEvent } from "@/library/dataset";
import { initializeEvents } from "@/data/events-enhanced";
import { clampBaseSeed } from "@/shared/seed-resolver";

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

  private getBaseSeed(): number {
    if (typeof window === "undefined") return clampBaseSeed(1);
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("seed");
      if (raw) {
        const parsed = clampBaseSeed(Number.parseInt(raw, 10));
        return parsed;
      }
      const stored = window.localStorage?.getItem("autocalendar_seed_base");
      if (stored) return clampBaseSeed(Number.parseInt(stored, 10));
    } catch {
      // ignore
    }
    return clampBaseSeed(1);
  }

  private async initialize(): Promise<void> {
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    try {
      const effectiveSeed = this.getBaseSeed();
      this.currentSeed = effectiveSeed;
      const events = await initializeEvents(effectiveSeed);
      this.setEvents(events);
    } catch (error) {
      console.error("[autocalendar/data-provider] Failed to initialize data:", error);
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
    if (this.loadingPromise) return this.loadingPromise;
    const targetSeed = clampBaseSeed(seedValue ?? this.getBaseSeed());
    if (targetSeed === this.currentSeed && this.ready) return;
    this.currentSeed = targetSeed;
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.loadingPromise = (async () => {
      try {
        const events = await initializeEvents(targetSeed);
        this.setEvents(events);
      } catch (error) {
        console.error("[autocalendar] Failed to reload data:", error);
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    return this.loadingPromise;
  }

  private setEvents(nextEvents: CalendarEvent[]): void {
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
    return false;
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
