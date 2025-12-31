export {
  dynamicDataProvider,
  getHotels,
  getHotelById,
  getFeaturedHotels,
  getRelatedHotels,
  getAvailableRegions,
  searchHotels,
} from "./data-provider";
export type { HotelSearchFilters } from "./data-provider";

// Export whenReady function
export const whenReady = () => dynamicDataProvider.whenReady();
