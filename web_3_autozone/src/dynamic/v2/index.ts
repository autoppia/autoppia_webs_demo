/**
 * V2 Data Loading System
 * 
 * Loads different data subsets based on v2 seed.
 */
export { 
  dynamicDataProvider,
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getStaticCategories,
  getStaticHomeEssentials,
  getStaticRefreshSpace,
  getLayoutConfig,
  getEffectiveSeed,
  searchProducts,
  isDynamicModeEnabled,
} from './data-provider';
export type { Product } from '@/context/CartContext';

// Export whenReady function
import { dynamicDataProvider } from "./data-provider";
export const whenReady = () => dynamicDataProvider.whenReady();
