import { initializeHotels } from "@/data/hotels-enhanced";
import { Hotel } from "@/types/hotel";
import { isDataGenerationEnabled, generateProjectData } from "@/shared/data-generator";
import { getRandomHotelImage } from "@/shared/data-generator";

/**
 * Dynamic Data Provider for Autolodge
 * Manages hotel data loading with caching and fallback support
 */
class DynamicDataProvider {
  private hotels: Hotel[] = [];
  private ready = false;
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.initialize();
  }

  /**
   * Initialize the data provider
   */
  async initialize(): Promise<void> {
    try {
      this.hotels = await initializeHotels();
      this.ready = true;
      console.log('🎯 DynamicDataProvider initialized with', this.hotels.length, 'hotels');
    } catch (error) {
      console.error('❌ Failed to initialize DynamicDataProvider:', error);
      this.ready = true; // Mark as ready even if failed to prevent infinite loading
    }
  }

  /**
   * Get all hotels
   */
  getHotels(): Hotel[] {
    return this.hotels;
  }

  /**
   * Get hotels filtered by location
   */
  getHotelsByLocation(location: string): Hotel[] {
    return this.hotels.filter(hotel => 
      hotel.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Get hotel by ID
   * If not found and data generation is enabled, will attempt to generate on-demand
   */
  getHotelById(id: number): Hotel | undefined {
    return this.hotels.find(hotel => hotel.id === id);
  }

  /**
   * Get hotel by ID, generating on-demand if not found and data generation is enabled
   */
  async getHotelByIdOrGenerate(id: number): Promise<Hotel | undefined> {
    // First check if hotel exists
    const existing = this.getHotelById(id);
    if (existing) {
      return existing;
    }

    // If data generation is enabled, try to generate a hotel
    if (isDataGenerationEnabled() && typeof window !== "undefined") {
      try {
        console.log(`🔄 Generating hotel on-demand for ID: ${id}`);
        const result = await generateProjectData("web_8_autolodge", 1);
        
        if (result.success && result.data.length > 0) {
          const generatedHotel = result.data[0];
          // Set the ID to match the requested ID
          const hotelWithCorrectId: Hotel = {
            ...generatedHotel,
            id: id,
            image: getRandomHotelImage(id - 1)
          };
          
          // Add to cache
          this.hotels.push(hotelWithCorrectId);
          console.log(`✅ Generated and cached hotel with ID: ${id}`);
          return hotelWithCorrectId;
        }
      } catch (error) {
        console.error(`❌ Failed to generate hotel on-demand for ID ${id}:`, error);
      }
    }

    return undefined;
  }

  /**
   * Get hotels filtered by price range
   */
  getHotelsByPriceRange(minPrice: number, maxPrice: number): Hotel[] {
    return this.hotels.filter(hotel => 
      hotel.price >= minPrice && hotel.price <= maxPrice
    );
  }

  /**
   * Get hotels filtered by rating
   */
  getHotelsByRating(minRating: number): Hotel[] {
    return this.hotels.filter(hotel => hotel.rating >= minRating);
  }

  /**
   * Search hotels by title or location
   */
  searchHotels(query: string): Hotel[] {
    const searchTerm = query.toLowerCase();
    return this.hotels.filter(hotel => 
      hotel.title.toLowerCase().includes(searchTerm) ||
      hotel.location.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Check if data is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Wait for data to be ready
   */
  async whenReady(): Promise<void> {
    await this.readyPromise;
  }

  /**
   * Get data loading status
   */
  getStatus(): { ready: boolean; count: number } {
    return {
      ready: this.ready,
      count: this.hotels.length
    };
  }
}

// Export singleton instance
export const dynamicDataProvider = new DynamicDataProvider();

/**
 * Check if dynamic mode is enabled
 */
export function isDynamicModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const val = (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_HTML ??
    process.env.ENABLE_DYNAMIC_HTML ??
    ''
  ).toString().toLowerCase();

  return ['true', '1', 'yes', 'on'].includes(val);
}

/**
 * Get effective seed value (1-300 range)
 */
export function getEffectiveSeed(seed: number): number {
  if (isNaN(seed) || seed < 1) return 1;
  return ((seed - 1) % 300) + 1;
}

/**
 * Get layout configuration
 */
export function getLayoutConfig(seed?: number, pageType: 'stay' | 'confirm' = 'stay') {
  // This would typically import from utils, but to avoid circular imports,
  // we'll return a basic config here
  return {
    searchBar: { position: 'top', wrapper: 'div', className: 'w-full flex justify-center mb-6' },
    propertyDetail: { layout: 'vertical', wrapper: 'div', className: 'max-w-4xl mx-auto px-4 py-8' },
    eventElements: { 
      order: pageType === 'confirm' 
        ? ['search', 'view', 'dates', 'guests', 'message', 'wishlist', 'share', 'back', 'confirm']
        : ['search', 'view', 'dates', 'guests', 'message', 'wishlist', 'share', 'back', 'reserve'], 
      wrapper: 'div', 
      className: 'flex flex-col gap-6' 
    }
  };
}