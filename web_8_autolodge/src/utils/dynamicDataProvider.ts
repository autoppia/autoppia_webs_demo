import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 1 if invalid
  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }
    
    // Validate seed range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }
    
    return providedSeed;
  }

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    return getEffectiveLayoutConfig(seed);
  }

  // Static Hotel data - always available
  public getStaticHotels(): Array<{
    id: string;
    title: string;
    location: string;
    rating: number;
    price: number;
    image: string;
  }> {
    return [
      {
        id: "1",
        title: "Luxury Beach Resort",
        location: "Malibu, CA",
        rating: 4.8,
        price: 350,
        image: "/images/hotel1.jpeg"
      },
      {
        id: "2",
        title: "Mountain View Lodge",
        location: "Aspen, CO",
        rating: 4.7,
        price: 280,
        image: "/images/hotel2.jpeg"
      },
      {
        id: "3",
        title: "Downtown City Hotel",
        location: "New York, NY",
        rating: 4.5,
        price: 220,
        image: "/images/hotel3.png"
      },
      {
        id: "4",
        title: "Countryside Retreat",
        location: "Napa Valley, CA",
        rating: 4.9,
        price: 400,
        image: "/images/hotel4.png"
      }
    ];
  }

  public getStaticAmenities(): Array<{
    id: string;
    name: string;
    icon: string;
  }> {
    return [
      {
        id: "1",
        name: "Free WiFi",
        icon: "wifi"
      },
      {
        id: "2",
        name: "Swimming Pool",
        icon: "pool"
      },
      {
        id: "3",
        name: "Parking",
        icon: "parking"
      },
      {
        id: "4",
        name: "Gym",
        icon: "fitness"
      }
    ];
  }

  public getStaticRoomTypes(): Array<{
    id: string;
    name: string;
    capacity: number;
    price: number;
  }> {
    return [
      {
        id: "1",
        name: "Standard Room",
        capacity: 2,
        price: 150
      },
      {
        id: "2",
        name: "Deluxe Suite",
        capacity: 4,
        price: 300
      },
      {
        id: "3",
        name: "Penthouse",
        capacity: 6,
        price: 600
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

// Static data helpers
export const getStaticHotels = () => dynamicDataProvider.getStaticHotels();
export const getStaticAmenities = () => dynamicDataProvider.getStaticAmenities();
export const getStaticRoomTypes = () => dynamicDataProvider.getStaticRoomTypes();

