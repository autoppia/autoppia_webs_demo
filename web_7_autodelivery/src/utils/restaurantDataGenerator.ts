/**
 * Restaurant Data Generation Utility for Food Delivery
 * 
 * This utility provides restaurant data generation capabilities for the Food Delivery project.
 * It integrates with the universal data generation system and provides project-specific functionality.
 */

import type { Restaurant } from "@/data/restaurants";

import {
  generateProjectData, 
  isDataGenerationEnabled, 
  getApiBaseUrl,
  type DataGenerationResponse 
} from "../shared/data-generator";

const PROJECT_KEY = 'web_7_food_delivery';

/**
 * Generate restaurants for Food Delivery
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
    console.error("Data Generation is not Enabled, returning original.")
    return originalRestaurants;
  }

  try {
    const result = await generateRestaurants(count, categories);
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data as Restaurant[];
    }
  } catch (error) {
    console.warn('Restaurant data generation failed, using original restaurants:', error);
  }

  return originalRestaurants;
}

/**
 * Replace all restaurants with generated data
 */
export async function replaceAllRestaurants(
  count: number = 50,
  categories?: string[]
): Promise<Restaurant[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, cannot replace restaurants.")
    return [];
  }

  try {
    const result = await generateRestaurants(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data as Restaurant[];
    }
  } catch (error) {
    console.error('Failed to replace restaurants:', error);
  }

  return [];
}

/**
 * Add generated restaurants to existing ones
 */
export async function addGeneratedRestaurants(
  existingRestaurants: Restaurant[],
  count: number = 10,
  categories?: string[]
): Promise<Restaurant[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning existing restaurants.")
    return existingRestaurants;
  }

  try {
    const result = await generateRestaurants(count, categories);
    if (result.success && result.data.length > 0) {
      const generatedRestaurants = result.data as Restaurant[];
      return [...existingRestaurants, ...generatedRestaurants];
    }
  } catch (error) {
    console.warn('Failed to add generated restaurants, returning existing:', error);
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
 * Get the API base URL
 */
export function getApiUrl(): string {
  return getApiBaseUrl();
}