/**
 * Database seeded selection utilities
 */

export interface SeededSelectionParams {
  projectKey: string;
  entityType: string;
  seedValue: number;
  limit: number;
  method: 'select' | 'distribute';
  filterKey?: string;
}

/**
 * Check if DB load mode is enabled via environment variables
 */
export function isDbLoadModeEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_ENABLE_DB_MODE === 'true';
  }
  return process.env.ENABLE_DB_MODE === 'true';
}

/**
 * Get seed value from environment variables
 */
export function getSeedValueFromEnv(defaultValue: number = 1): number {
  const seedValue = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_DATA_SEED_VALUE 
    : process.env.DATA_SEED_VALUE;
  
  if (seedValue) {
    const parsed = parseInt(seedValue, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
}

/**
 * Fetch seeded selection from database
 */
export async function fetchSeededSelection<T>(params: SeededSelectionParams): Promise<T[]> {
  if (!isDbLoadModeEnabled()) {
    console.log("🔍 DB mode not enabled, returning empty array");
    return [];
  }

  try {
    const apiUrl = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'
      : process.env.API_URL || 'http://localhost:8090';

    const queryParams = new URLSearchParams({
      project_key: params.projectKey,
      entity_type: params.entityType,
      seed_value: params.seedValue.toString(),
      limit: params.limit.toString(),
      method: params.method,
      ...(params.filterKey && { filter_key: params.filterKey })
    });

    const response = await fetch(`${apiUrl}/datasets/load?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Seeded selection request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Failed to load seeded selection from DB:", error);
    throw error;
  }
}