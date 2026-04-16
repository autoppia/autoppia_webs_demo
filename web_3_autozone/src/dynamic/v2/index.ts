/**
 * V2 Data Loading System
 *
 * Loads different data subsets based on v2 seed.
 */
export {
  dynamicDataProvider,
  getProductById,
  getProductsByCategory,
  getAllProducts,
  getEffectiveSeed,
  searchProducts,
} from './data-provider';
export type { Product } from '@/context/CartContext';
