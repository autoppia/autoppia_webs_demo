/**
 * V2 Data Loading System
 *
 * Loads different data subsets based on v2 seed.
 */

import { dynamicDataProvider } from "./data-provider";

export {
  dynamicDataProvider,
  initializeRestaurants,
  getRestaurants,
  getRestaurantsFromProvider,
  getRestaurantById,
  getRestaurantsByCuisine,
  getFeaturedRestaurants,
  searchRestaurants,
  isDynamicModeEnabled,
} from "./data-provider";
export type { RestaurantGenerated } from "./data-provider";

// Export whenReady function
export const whenReady = () => dynamicDataProvider.whenReady();
