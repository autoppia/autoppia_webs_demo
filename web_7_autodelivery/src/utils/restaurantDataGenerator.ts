/**
 * Restaurant Data Generation Utility for Food Delivery Platform
 * 
 * This utility provides restaurant data generation capabilities for the web_7 project.
 * It integrates with the universal data generation system and provides project-specific functionality.
 */

import type { Restaurant } from "@/data/restaurants";
import {
  generateProjectData,
  isDataGenerationEnabled,
  getApiBaseUrl,
  type DataGenerationResponse,
} from "../shared/data-generator";

const PROJECT_KEY = "web_7_food_delivery";

/**
 * Generate restaurants for Food Delivery Platform
 */
export async function generateRestaurants(
  count: number = 10,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(PROJECT_KEY, count, categories);
}

/**
 * Generate restaurants with fallback to original data
 */
export async function generateRestaurantsWithFallback(
  originalRestaurants: Restaurant[],
  count: number = 10,
  categories?: string[]
): Promise<Restaurant[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.");
    return originalRestaurants;
  }

  try {
    const result = await generateRestaurants(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data as Restaurant[];
    }
  } catch (error) {
    console.warn("Restaurant data generation failed, using original restaurants:", error);
  }

  return originalRestaurants;
}

/**
 * Replace all restaurants with generated ones
 */
export async function replaceAllRestaurants(
  count: number = 50,
  categories?: string[]
): Promise<Restaurant[]> {
  if (!isDataGenerationEnabled()) {
    throw new Error("Data generation is not enabled");
  }

  const result = await generateRestaurants(count, categories);
  if (!result.success) {
    throw new Error(result.error || "Failed to generate restaurants");
  }

  return result.data as Restaurant[];
}

/**
 * Add generated restaurants to existing ones
 */
export async function addGeneratedRestaurants(
  existingRestaurants: Restaurant[],
  additionalCount: number = 10,
  categories?: string[]
): Promise<Restaurant[]> {
  if (!isDataGenerationEnabled()) {
    return existingRestaurants;
  }

  try {
    const result = await generateRestaurants(additionalCount, categories);
    if (result.success && result.data.length > 0) {
      return [...existingRestaurants, ...result.data as Restaurant[]];
    }
  } catch (error) {
    console.warn("Failed to add generated restaurants:", error);
  }

  return existingRestaurants;
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

