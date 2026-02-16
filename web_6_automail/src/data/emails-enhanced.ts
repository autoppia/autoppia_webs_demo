/**
 * Enhanced Emails Data with AI Generation Support
 *
 * This file provides both static and dynamic email data generation
 * for the AutoMail email client application.
 */

import type { Email } from "@/types/email";
import { readJson, writeJson } from "@/shared/storage";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

// Helper function to normalize email timestamps
function normalizeEmailTimestamps(emails: Email[]): Email[] {
  return emails.map((email) => ({
    ...email,
    timestamp: typeof email.timestamp === 'string'
      ? new Date(email.timestamp)
      : email.timestamp,
  }));
}

// Dynamic emails array (populated by initializeEmails from DB only)
let dynamicEmails: Email[] = [];

// Client-side cache to avoid regenerating on every reload
export function readCachedEmails(): Email[] | null {
  const cached = readJson<Email[]>("automail_generated_emails_v1", null);
  return cached ? normalizeEmailTimestamps(cached) : null;
}

export function writeCachedEmails(emailsToCache: Email[]): void {
  writeJson("automail_generated_emails_v1", emailsToCache);
}

const resolveSeed = (seedOverride?: number | null): number => {
  return clampBaseSeed(seedOverride ?? getBaseSeedFromUrl());
};

/**
 * Initialize emails with V2 system (DB mode only)
 */
export async function initializeEmails(seedOverride?: number | null): Promise<Email[]> {
  const effectiveSeed = resolveSeed(seedOverride);
  try {
    const emails = await fetchSeededSelection<Email>({
      projectKey: "web_6_automail",
      entityType: "emails",
      seedValue: effectiveSeed,
      limit: 50,
      method: "distribute",
      filterKey: "category",
    });

    if (Array.isArray(emails) && emails.length > 0) {
      console.log(
        `[automail] Loaded ${emails.length} emails from dataset (seed=${effectiveSeed})`
      );
      dynamicEmails = normalizeEmailTimestamps(emails);
      return dynamicEmails;
    }

    console.warn(`[automail] No emails returned from backend (seed=${effectiveSeed})`);
  } catch (error) {
    console.warn("[automail] Backend unavailable:", error);
  }

  dynamicEmails = [];
  return dynamicEmails;
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadEmailsFromDb(seedOverride?: number | null): Promise<Email[]> {
  const seed = resolveSeed(seedOverride);

  try {
    const limit = 50;
    const distributed = await fetchSeededSelection<Email>({
      projectKey: "web_6_automail",
      entityType: "emails",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "category",
    });
    const selected =
      Array.isArray(distributed) && distributed.length > 0
        ? distributed
        : await fetchSeededSelection<Email>({
            projectKey: "web_6_automail",
            entityType: "emails",
            seedValue: seed,
            limit,
            method: "select",
          });
    if (selected && selected.length > 0) {
      return normalizeEmailTimestamps(selected);
    }
  } catch (e) {
    console.warn("[automail] loadEmailsFromDb: Failed to load from DB:", e);
  }

  return [];
}

// Export the dynamic emails array for direct access
export { dynamicEmails as emails };
