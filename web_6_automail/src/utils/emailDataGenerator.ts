/**
 * Email Data Generation Utility for AutoMail
 * 
 * This utility provides email data generation capabilities for the AutoMail project.
 * It integrates with the universal data generation system and provides project-specific functionality.
 */

import type { Email } from "@/types/email";

import {
  generateProjectData, 
  isDataGenerationEnabled, 
  getApiBaseUrl,
  type DataGenerationResponse 
} from "../shared/data-generator";

const PROJECT_KEY = 'web_6_automail';

/**
 * Generate emails for AutoMail
 */
export async function generateEmails(
  count: number = 10,
  categories?: string[]
): Promise<DataGenerationResponse> {
  return await generateProjectData(PROJECT_KEY, count, categories);
}

/**
 * Generate emails with fallback to original data
 */
export async function generateEmailsWithFallback(
  originalEmails: Email[],
  count: number = 10,
  categories?: string[]
): Promise<Email[]> {
  if (!isDataGenerationEnabled()) {
    console.error("Data Generation is not Enabled, returning original.")
    return originalEmails;
  }

  try {
    const result = await generateEmails(count, categories);
    if (result.success && result.data.length > 0) {
      return result.data as Email[];
    }
  } catch (error) {
    console.warn('Email data generation failed, using original emails:', error);
  }

  return originalEmails;
}

/**
 * Replace all emails with generated ones
 */
export async function replaceAllEmails(
  count: number = 50,
  categories?: string[]
): Promise<Email[]> {
  if (!isDataGenerationEnabled()) {
    throw new Error('Data generation is not enabled');
  }

  const result = await generateEmails(count, categories);
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate emails');
  }

  return result.data as Email[];
}

/**
 * Add generated emails to existing ones
 */
export async function addGeneratedEmails(
  existingEmails: Email[],
  additionalCount: number = 10,
  categories?: string[]
): Promise<Email[]> {
  if (!isDataGenerationEnabled()) {
    return existingEmails;
  }

  try {
    const result = await generateEmails(additionalCount, categories);
    if (result.success && result.data.length > 0) {
      return [...existingEmails, ...result.data as Email[]];
    }
  } catch (error) {
    console.warn('Failed to add generated emails:', error);
  }

  return existingEmails;
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

