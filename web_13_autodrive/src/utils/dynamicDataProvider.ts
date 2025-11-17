import { getSeedLayout } from "@/library/layouts";
import { initializeTrips } from "@/data/trips-enhanced";
import type { Trip } from "@/library/dataset";

// Check if dynamic HTML is enabled via environment variable (seed-based structure flag)
const isDynamicHtmlEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE === 'true';
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;
  private trips: Trip[] = [];
  private ready: boolean = false;
  private readyPromise: Promise<void> | null = null;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
    try {
      console.log('[web13][provider] ctor', { dynamicHtml: this.isEnabled, env: {
        NEXT_PUBLIC_API_URL: process.env?.NEXT_PUBLIC_API_URL,
        ENABLE_DYNAMIC_V2_AI_GENERATE: process.env?.ENABLE_DYNAMIC_V2_AI_GENERATE,
        NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE: process.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE,
        ENABLE_DYNAMIC_V2_DB_MODE: process.env?.ENABLE_DYNAMIC_V2_DB_MODE,
        NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE: process.env?.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE,
      }});
    } catch {}
    // Client-side async initialization for trips
    if (typeof window !== 'undefined') {
      console.log('[web13][provider] initializing on client...');
      this.readyPromise = this.initialize();
    } else {
      console.log('[web13][provider] running on server, skipping client init');
      this.ready = true;
    }
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private parseSeed(raw: string | null): number | null {
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 300) {
      console.warn("[web13][provider] Ignoring invalid v2-seed value:", raw);
      return null;
    }
    return parsed;
  }

  private getV2SeedFromUrl(): number | null {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = this.parseSeed(params.get("v2-seed"));
      if (fromUrl !== null) {
        return fromUrl;
      }
      const stored = this.parseSeed(localStorage.getItem("autodrive_v2_seed"));
      if (stored !== null) {
        return stored;
      }
    } catch (error) {
      console.warn("[web13][provider] Failed to read v2-seed from URL/localStorage:", error);
    }
    return null;
  }

  private async initialize(): Promise<void> {
    try {
      console.log('[web13][provider] initialize() start');
      const v2Seed = this.getV2SeedFromUrl();
      this.trips = await initializeTrips(30, v2Seed);
      console.log('[web13][provider] initialize() loaded trips', {
        count: this.trips.length,
        seed: v2Seed ?? "default",
      });
    } catch (error) {
      console.error("[web13][provider] Failed to initialize trips", error);
      throw error;
    } finally {
      console.log('[web13][provider] initialize() complete');
      this.ready = true;
    }
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public async whenReady(): Promise<void> {
    if (this.ready) return;
    if (this.readyPromise) await this.readyPromise;
  }

  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 1 if invalid
  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }
    
    // Validate seed range (1-300), default to 1 if invalid
    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }
    
    return providedSeed;
  }

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    return getSeedLayout(seed);
  }

  // Generated trips accessors
  public getTrips(): Trip[] {
    return this.trips;
  }

  public getTripsByStatus(status: Trip["status"]): Trip[] {
    return this.trips.filter(t => t.status === status);
  }

  public searchTrips(term: string): Trip[] {
    const q = term.toLowerCase();
    return this.trips.filter(t =>
      t.pickup.toLowerCase().includes(q) ||
      t.dropoff.toLowerCase().includes(q) ||
      t.driver.name.toLowerCase().includes(q) ||
      t.ride.name.toLowerCase().includes(q)
    );
  }

  // Static rides data - always available
  public getStaticRides(): Array<{
    id: string;
    name: string;
    type: string;
    price: string;
    eta: string;
    maxPassengers: number;
    imageUrl?: string;
    features: string[];
  }> {
    return [
      {
        id: "1",
        name: "AutoDriverX",
        type: "economy",
        price: "$26.60",
        eta: "3 min",
        maxPassengers: 4,
        imageUrl: "/car1.jpg",
        features: ["Economical", "Fast pick up", "Clean vehicle"]
      },
      {
        id: "2", 
        name: "Comfort",
        type: "premium",
        price: "$31.50",
        eta: "5 min",
        maxPassengers: 4,
        imageUrl: "/car2.jpg",
        features: ["Spacious", "Premium cars", "Friendly drivers"]
      },
      {
        id: "3",
        name: "AutoDriverXL",
        type: "xl",
        price: "$38.75",
        eta: "7 min",
        maxPassengers: 6,
        imageUrl: "/car3.jpg",
        features: ["Extra space", "Group friendly", "Family vehicle"]
      },
      {
        id: "4",
        name: "Business",
        type: "luxury",
        price: "$65.20",
        eta: "4 min",
        maxPassengers: 4,
        imageUrl: "/dashboard.jpg",
        features: ["Luxury car", "Professional driver", "Recharge ports"]
      }
    ];
  }

  public getStaticDrivers(): Array<{
    id: string;
    name: string;
    rating: number;
    trips: number;
    vehicleModel: string;
    licensePlate: string;
    profileImage?: string;
    status: string;
    languages: string[];
  }> {
    return [
      {
        id: "1",
        name: "Carlos Mendez",
        rating: 4.9,
        trips: 1247,
        vehicleModel: "Toyota Camry 2022",
        licensePlate: "ABC-123",
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
        status: "available",
        languages: ["English", "Spanish"]
      },
      {
        id: "2",
        name: "Sarah Johnson",
        rating: 4.8,
        trips: 892,
        vehicleModel: "Honda Accord 2021",
        licensePlate: "XYZ-789",
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
        status: "busy",
        languages: ["English"]
      },
      {
        id: "3",
        name: "Ahmed Hassan",
        rating: 5.0,
        trips: 2103,
        vehicleModel: "BMW 5 Series 2023",
        licensePlate: "DEF-456",
        profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
        status: "available",
        languages: ["English", "Arabic"]
      },
      {
        id: "4",
        name: "Maria Garcia",
        rating: 4.7,
        trips: 567,
        vehicleModel: "Mercedes E-Class 2022",
        licensePlate: "GHI-789",
        profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
        status: "offline",
        languages: ["English", "Spanish", "Portuguese"]
      }
    ];
  }

  public getStaticTrips(): Array<{
    id: string;
    pickup: string;
    destination: string;
    scheduledTime: string;
    duration: string;
    fare: string;
    status: string;
    driverId: string;
    rideType: string;
    requestTime: string;
  }> {
    return [
      {
        id: "T001",
        pickup: "123 Market Street, San Francisco, CA",
        destination: "Golden Gate Bridge, San Francisco, CA",
        scheduledTime: "2024-01-15T09:30:00Z",
        duration: "15 minutes",
        fare: "$32.50",
        status: "completed",
        driverId: "1",
        rideType: "comfort",
        requestTime: "2024-01-15T09:15:00Z"
      },
      {
        id: "T002",
        pickup: "SFO Airport, San Francisco, CA",
        destination: "Union Square, San Francisco, CA",
        scheduledTime: "2024-01-15T14:45:00Z",
        duration: "25 minutes",
        fare: "$28.75",
        status: "active",
        driverId: "3",
        rideType: "economy",
        requestTime: "2024-01-15T14:30:00Z"
      },
      {
        id: "T003",
        pickup: "Fisherman's Wharf, San Francisco, CA",
        destination: "Coit Tower, San Francisco, CA",
        scheduledTime: "2024-01-15T16:20:00Z",
        duration: "8 minutes",
        fare: "$18.25",
        status: "scheduled",
        driverId: "2",
        rideType: "xl",
        requestTime: "2024-01-15T16:00:00Z"
      },
      {
        id: "T004",
        pickup: "Castro District, San Francisco, CA",
        destination: "Mission District, San Francisco, CA",
        scheduledTime: "2024-01-15T11:10:00Z",
        duration: "12 minutes",
        fare: "$22.80",
        status: "completed",
        driverId: "1",
        rideType: "business",
        requestTime: "2024-01-15T10:55:00Z"
      }
    ];
  }

  public getStaticLocations(): Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
    popularTimes?: string[];
    amenities: string[];
  }> {
    return [
      {
        id: "L001",
        name: "Union Square",
        address: "Union Square, San Francisco, CA 94108, USA",
        latitude: 37.787994,
        longitude: -122.407437,
        category: "landmark",
        popularTimes: ["7:00 AM", "12:00 PM", "6:00 PM"],
        amenities: ["shopping", "dining", "hotels"]
      },
      {
        id: "L002",
        name: "Golden Gate Bridge",
        address: "Golden Gate Bridge, San Francisco, CA 94129, USA",
        latitude: 37.819928,
        longitude: -122.478255,
        category: "landmark",
        popularTimes: ["8:00 AM", "2:00 PM", "4:00 PM"],
        amenities: ["walking", "photo opportunities", "scenic views"]
      },
      {
        id: "L003",
        name: "SFO Airport",
        address: "San Francisco International Airport, San Francisco, CA 94128, USA",
        latitude: 37.6212624,
        longitude: -122.3776852,
        category: "transit",
        popularTimes: ["5:00 AM", "10:00 AM", "7:00 PM"],
        amenities: ["terminal access", "parking", "dining", "fuel"]
      },
      {
        id: "L004",
        name: "Fisherman's Wharf",
        address: "Pier 39, San Francisco, CA 94133, USA",
        latitude: 37.808673,
        longitude: -122.409821,
        category: "tourist",
        popularTimes: ["9:00 AM", "2:00 PM", "5:00 PM"],
        amenities: ["shopping", "dining", "entertainment", "parking"]
      }
    ];
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);
export const isDataReady = () => dynamicDataProvider.isReady();
export const whenDataReady = () => dynamicDataProvider.whenReady();
export const getTrips = () => dynamicDataProvider.getTrips();
export const getTripsByStatus = (status: Trip["status"]) => dynamicDataProvider.getTripsByStatus(status);
export const searchTrips = (term: string) => dynamicDataProvider.searchTrips(term);

// Static data helpers
export const getStaticRides = () => dynamicDataProvider.getStaticRides();
export const getStaticDrivers = () => dynamicDataProvider.getStaticDrivers();
export const getStaticTrips = () => dynamicDataProvider.getStaticTrips();
export const getStaticLocations = () => dynamicDataProvider.getStaticLocations();
