/**
 * V2 Data Loading System
 * 
 * Loads different data subsets based on v2 seed.
 */

export { initializeProducts } from './products-loader';
export { 
  dynamicDataProvider,
  getProductsByCategory,
  getStaticCategories,
  getStaticHomeEssentials,
  getStaticRefreshSpace,
  getLayoutConfig,
  getEffectiveSeed,
  searchProducts
} from './data-provider';
export type { Product } from '@/context/CartContext';

// Export whenReady function
export const whenReady = () => dynamicDataProvider.whenReady();

