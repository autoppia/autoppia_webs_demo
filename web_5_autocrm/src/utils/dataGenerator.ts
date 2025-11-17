/**
 * Data Generation Utility for AutoCRM
 * 
 * This utility provides data generation capabilities for the AutoCRM project.
 * It integrates with the universal data generation system and provides project-specific functionality.
 */

import {
  generateProjectData, 
  isDataGenerationEnabled, 
  getApiBaseUrl,
  type DataGenerationResponse 
} from "../shared/data-generator";

const PROJECT_KEY = 'web_5_autocrm';

/**
 * Generate clients for AutoCRM
 */
export async function generateClients(
  count: number = 50,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(PROJECT_KEY, count, categories);
}

/**
 * Generate matters for AutoCRM
 */
export async function generateMatters(
  count: number = 50,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(`${PROJECT_KEY}:matters`, count, categories);
}

/**
 * Generate files for AutoCRM
 */
export async function generateFiles(
  count: number = 50,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(`${PROJECT_KEY}:files`, count, categories);
}

/**
 * Generate calendar events for AutoCRM
 */
export async function generateEvents(
  count: number = 50,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(`${PROJECT_KEY}:events`, count, categories);
}

/**
 * Generate billing logs for AutoCRM
 */
export async function generateLogs(
  count: number = 50,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(`${PROJECT_KEY}:logs`, count, categories);
}

/**
 * Generate clients with fallback to original data
 */
export async function generateClientsWithFallback(
  originalClients: any[],
  count: number = 50,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.")
    return originalClients;
  }

  try {
    const result = await generateClients(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data;
    }
  } catch (error) {
    console.warn('Data generation failed, using original clients:', error);
  }

  return originalClients;
}

/**
 * Generate matters with fallback to original data
 */
export async function generateMattersWithFallback(
  originalMatters: any[],
  count: number = 50,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.")
    return originalMatters;
  }

  try {
    const result = await generateMatters(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data;
    }
  } catch (error) {
    console.warn('Data generation failed, using original matters:', error);
  }

  return originalMatters;
}

/**
 * Generate files with fallback to original data
 */
export async function generateFilesWithFallback(
  originalFiles: any[],
  count: number = 50,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.")
    return originalFiles;
  }

  try {
    const result = await generateFiles(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data;
    }
  } catch (error) {
    console.warn('Data generation failed, using original files:', error);
  }

  return originalFiles;
}

/**
 * Generate events with fallback to original data
 */
export async function generateEventsWithFallback(
  originalEvents: any[],
  count: number = 50,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.")
    return originalEvents;
  }

  try {
    const result = await generateEvents(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data;
    }
  } catch (error) {
    console.warn('Data generation failed, using original events:', error);
  }

  return originalEvents;
}

/**
 * Generate logs with fallback to original data
 */
export async function generateLogsWithFallback(
  originalLogs: any[],
  count: number = 50,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.")
    return originalLogs;
  }

  try {
    const result = await generateLogs(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data;
    }
  } catch (error) {
    console.warn('Data generation failed, using original logs:', error);
  }

  return originalLogs;
}

/**
 * Replace all clients with generated ones
 */
export async function replaceAllClients(
  count: number = 60,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    throw new Error('Data generation is not enabled');
  }

  const result = await generateClients(count, categories);
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate clients');
  }

  return result.data;
}

/**
 * Replace all matters with generated ones
 */
export async function replaceAllMatters(
  count: number = 50,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    throw new Error('Data generation is not enabled');
  }

  const result = await generateMatters(count, categories);
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate matters');
  }

  return result.data;
}

/**
 * Add generated clients to existing ones
 */
export async function addGeneratedClients(
  existingClients: any[],
  additionalCount: number = 20,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    return existingClients;
  }

  try {
    const result = await generateClients(additionalCount, categories);
    if (result.success && result.data.length > 0) {
      return [...existingClients, ...result.data];
    }
  } catch (error) {
    console.warn('Failed to add generated clients:', error);
  }

  return existingClients;
}

/**
 * Add generated matters to existing ones
 */
export async function addGeneratedMatters(
  existingMatters: any[],
  additionalCount: number = 20,
  categories?: string[]
): Promise<any[]> {
  if (!isDataGenerationEnabled()) {
    return existingMatters;
  }

  try {
    const result = await generateMatters(additionalCount, categories);
    if (result.success && result.data.length > 0) {
      return [...existingMatters, ...result.data];
    }
  } catch (error) {
    console.warn('Failed to add generated matters:', error);
  }

  return existingMatters;
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

