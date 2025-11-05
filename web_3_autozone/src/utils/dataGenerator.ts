/**
 * Data Generation Utility for AutoZone
 * 
 * This utility provides data generation capabilities for the AutoZone e-commerce project.
 * It integrates with the universal data generation system and provides project-specific functionality.
 */

import type { Product } from "@/context/CartContext";

import {
  generateProjectData, 
  isDataGenerationEnabled, 
  getApiBaseUrl,
  type DataGenerationResponse 
} from "../shared/data-generator";

const PROJECT_KEY = 'web_3_autozone';

/**
 * Generate products for AutoZone
 */
export async function generateProducts(
  count: number = 10,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(PROJECT_KEY, count, categories);
}

/**
 * Generate products with fallback to original data
 */
export async function generateProductsWithFallback(
  originalProducts: Product[],
  count: number = 10,
  categories?: string[]
): Promise<Product[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.")
    return originalProducts;
  }

  try {
    const result = await generateProducts(count, categories);
    if (result.success && result.data.length > 0) {
      // console.log("GENERATED RECEIVED: ", result.data)
      return result.data as Product[];
    }
  } catch (error) {
    console.warn('Data generation failed, using original products:', error);
  }

  return originalProducts;
}

/**
 * Replace all products with generated ones
 */
export async function replaceAllProducts(
  count: number = 50,
  categories?: string[]
): Promise<Product[]> {
  if (!isDataGenerationEnabled()) {
    throw new Error('Data generation is not enabled');
  }

  const result = await generateProducts(count, categories);
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate products');
  }

  return result.data as Product[];
}

/**
 * Add generated products to existing ones
 */
export async function addGeneratedProducts(
  existingProducts: Product[],
  additionalCount: number = 10,
  categories?: string[]
): Promise<Product[]> {
  if (!isDataGenerationEnabled()) {
    return existingProducts;
  }

  try {
    const result = await generateProducts(additionalCount, categories);
    if (result.success && result.data.length > 0) {
      return [...existingProducts, ...result.data as Product[]];
    }
  } catch (error) {
    console.warn('Failed to add generated products:', error);
  }

  return existingProducts;
}


/**
 * Check if data generation is available
 */
export function isDataGenerationAvailable(): boolean {
  return isDataGenerationEnabled();
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return getApiBaseUrl();
}
