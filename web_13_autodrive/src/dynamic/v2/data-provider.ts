import type { Trip } from "@/data/trips-enhanced";
import { initializeTrips } from "@/data/trips-enhanced";
import type { Place } from "@/data/places-enhanced";
import { initializePlaces } from "@/data/places-enhanced";
import type { Ride } from "@/data/rides-enhanced";
import { initializeRides } from "@/data/rides-enhanced";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private trips: Trip[] = [];
  private places: Place[] = [];
  private rides: Ride[] = [];
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;
  private subscribers: ((trips: Trip[]) => void)[] = [];
  private placesSubscribers: ((places: Place[]) => void)[] = [];
  private ridesSubscribers: ((rides: Ride[]) => void)[] = [];

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
    const value = (window as any).__autodriveV2Seed;
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
      this.currentSeed = runtimeSeed ?? 1;

      // Always initialize from server - server determines whether v2 is enabled or disabled
      console.log("[autodrive/data-provider] Initializing from server, runtimeSeed:", runtimeSeed, "baseSeed:", baseSeed);

      // Initialize all data types (they handle server loading internally)
      const [trips, places, rides] = await Promise.all([
        initializeTrips(runtimeSeed ?? undefined),
        initializePlaces(runtimeSeed ?? undefined),
        initializeRides(runtimeSeed ?? undefined),
      ]);

      this.setTrips(trips);
      this.setPlaces(places);
      this.setRides(rides);

      console.log("[autodrive/data-provider] ✅ Data initialized:", {
        trips: trips.length,
        places: places.length,
        rides: rides.length,
      });
    } catch (error) {
      console.error("[autodrive/data-provider] Failed to initialize data:", error);
      // Re-throw error - server is the single source of truth
      throw error;
    }

    // Listen for seed changes
    if (typeof window !== "undefined") {
      window.addEventListener("autodrive:v2SeedChange", this.handleSeedEvent.bind(this));
    }
  }

  private handleSeedEvent = () => {
    console.log("[autodrive/data-provider] Seed change event received");
    this.reload();
  };

  public async reload(seedValue?: number | null): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        const v2Seed = seedValue ?? this.getRuntimeV2Seed() ?? 1;
        this.currentSeed = v2Seed;

        console.log(`[autodrive] Reloading trips, places, and rides for seed=${this.currentSeed}...`);
        this.ready = false;
        this.trips = []; // Clear existing data
        this.places = []; // Clear existing data
        this.rides = []; // Clear existing data
        this.notifySubscribers(); // Notify with empty array
        this.notifyPlacesSubscribers(); // Notify places subscribers with empty array
        this.notifyRidesSubscribers(); // Notify rides subscribers with empty array

        // Clear sessionStorage related to ride reservation when seed changes
        // This prevents showing wrong ride information on confirmation page
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("__ud_reserveRideData");
            sessionStorage.removeItem("__ud_selectedRideIdx");
            console.log("[autodrive/data-provider] Cleared ride reservation data from sessionStorage");
          } catch (error) {
            console.warn("[autodrive/data-provider] Failed to clear sessionStorage:", error);
          }
        }

        const [newTrips, newPlaces, newRides] = await Promise.all([
          initializeTrips(this.currentSeed),
          initializePlaces(this.currentSeed),
          initializeRides(this.currentSeed),
        ]);
        this.setTrips(newTrips);
        this.setPlaces(newPlaces);
        this.setRides(newRides);
        console.log(`[autodrive] Data reloaded: ${newTrips.length} trips, ${newPlaces.length} places, ${newRides.length} rides`);
      } catch (error) {
        console.error("[autodrive/data-provider] Failed to reload data:", error);
        throw error;
      } finally {
        this.ready = true;
        this.loadingPromise = null;
      }
    })();
    await this.loadingPromise;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  public getTrips(limit?: number): Trip[] {
    const items = [...this.trips];
    if (limit && Number.isFinite(limit)) {
      return items.slice(0, limit);
    }
    return items;
  }

  public setTrips(newTrips: Trip[]): void {
    this.trips = newTrips;
    this.notifySubscribers();
  }

  public subscribeTrips(callback: (trips: Trip[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.trips); // Immediately provide current data
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.trips));
  }

  public getTripById(id: string): Trip | undefined {
    return this.trips.find((trip) => trip.id === id);
  }

  public getPlaces(limit?: number): Place[] {
    const items = [...this.places];
    if (limit && Number.isFinite(limit)) {
      return items.slice(0, limit);
    }
    return items;
  }

  public setPlaces(newPlaces: Place[]): void {
    this.places = newPlaces;
    this.notifyPlacesSubscribers();
  }

  public subscribePlaces(callback: (places: Place[]) => void): () => void {
    this.placesSubscribers.push(callback);
    callback(this.places); // Immediately provide current data
    return () => {
      this.placesSubscribers = this.placesSubscribers.filter((sub) => sub !== callback);
    };
  }

  private notifyPlacesSubscribers(): void {
    this.placesSubscribers.forEach((callback) => callback(this.places));
  }

  public getPlaceById(id: string): Place | undefined {
    return this.places.find((place) => place.id === id);
  }

  public getRides(limit?: number): Ride[] {
    const items = [...this.rides];
    if (limit && Number.isFinite(limit)) {
      return items.slice(0, limit);
    }
    return items;
  }

  public setRides(newRides: Ride[]): void {
    this.rides = newRides;
    this.notifyRidesSubscribers();
  }

  public subscribeRides(callback: (rides: Ride[]) => void): () => void {
    this.ridesSubscribers.push(callback);
    callback(this.rides); // Immediately provide current data
    return () => {
      this.ridesSubscribers = this.ridesSubscribers.filter((sub) => sub !== callback);
    };
  }

  private notifyRidesSubscribers(): void {
    this.ridesSubscribers.forEach((callback) => callback(this.rides));
  }

  public getRideById(id: string): Ride | undefined {
    return this.rides.find((ride) => ride.id === id);
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getTrips = (limit?: number) => dynamicDataProvider.getTrips(limit);
export const getTripById = (id: string) => dynamicDataProvider.getTripById(id);
export const getPlaces = (limit?: number) => dynamicDataProvider.getPlaces(limit);
export const getPlaceById = (id: string) => dynamicDataProvider.getPlaceById(id);
export const subscribePlaces = (callback: (places: Place[]) => void) => dynamicDataProvider.subscribePlaces(callback);
export const getRides = (limit?: number) => dynamicDataProvider.getRides(limit);
export const getRideById = (id: string) => dynamicDataProvider.getRideById(id);
export const subscribeRides = (callback: (rides: Ride[]) => void) => dynamicDataProvider.subscribeRides(callback);
export const whenReady = () => dynamicDataProvider.whenReady();
