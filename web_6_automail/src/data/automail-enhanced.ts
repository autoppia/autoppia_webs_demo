/**
 * Enhanced AutoMail data with V2 seeded loading support.
 *
 * Single module for all AutoMail entities (emails + templates).
 */

import type { Email } from "@/types/email";
import type { MailTemplate } from "@/types/template";
import { readJson, writeJson } from "@/shared/storage";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

const CACHE_KEYS = {
  emails: "automail_generated_emails_v1",
  templates: "automail_templates_v1",
} as const;

// Dynamic arrays (populated from seeded backend data)
let dynamicEmails: Email[] = [];
let dynamicTemplates: MailTemplate[] = [];

function resolveSeed(seedOverride?: number | null): number {
  return isV2Enabled() ? clampSeed(seedOverride ?? getSeedFromUrl()) : 1;
}

function normalizeEmailTimestamps(emails: Email[]): Email[] {
  return emails.map((email) => ({
    ...email,
    timestamp:
      typeof email.timestamp === "string"
        ? new Date(email.timestamp)
        : email.timestamp,
  }));
}

export function readCachedEmails(): Email[] | null {
  const cached = readJson<Email[]>(CACHE_KEYS.emails, null);
  return cached ? normalizeEmailTimestamps(cached) : null;
}

export function writeCachedEmails(emailsToCache: Email[]): void {
  writeJson(CACHE_KEYS.emails, emailsToCache);
}

export function readCachedTemplates(): MailTemplate[] | null {
  return readJson<MailTemplate[]>(CACHE_KEYS.templates, null);
}

export function writeCachedTemplates(templatesToCache: MailTemplate[]): void {
  writeJson(CACHE_KEYS.templates, templatesToCache);
}

export async function initializeEmails(
  seedOverride?: number | null,
): Promise<Email[]> {
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
      dynamicEmails = normalizeEmailTimestamps(emails);
      return dynamicEmails;
    }
  } catch (error) {
    console.warn("[automail] Backend unavailable for emails:", error);
  }

  dynamicEmails = [];
  return dynamicEmails;
}

export async function loadEmailsFromDb(
  seedOverride?: number | null,
): Promise<Email[]> {
  const seed = resolveSeed(seedOverride);
  try {
    const distributed = await fetchSeededSelection<Email>({
      projectKey: "web_6_automail",
      entityType: "emails",
      seedValue: seed,
      limit: 50,
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
            limit: 50,
            method: "select",
          });
    if (Array.isArray(selected) && selected.length > 0) {
      return normalizeEmailTimestamps(selected);
    }
  } catch (error) {
    console.warn("[automail] loadEmailsFromDb failed:", error);
  }
  return [];
}

export async function initializeTemplates(
  seedOverride?: number | null,
): Promise<MailTemplate[]> {
  const effectiveSeed = resolveSeed(seedOverride);
  try {
    const templates = await fetchSeededSelection<MailTemplate>({
      projectKey: "web_6_automail",
      entityType: "templates",
      seedValue: effectiveSeed,
      limit: 5,
      method: "select",
    });

    if (Array.isArray(templates) && templates.length > 0) {
      dynamicTemplates = templates;
      return dynamicTemplates;
    }
  } catch (error) {
    console.warn("[automail] Backend unavailable for templates:", error);
  }

  dynamicTemplates = [];
  return dynamicTemplates;
}

export async function loadTemplatesFromDb(
  seedOverride?: number | null,
): Promise<MailTemplate[]> {
  const seed = resolveSeed(seedOverride);
  try {
    const selected = await fetchSeededSelection<MailTemplate>({
      projectKey: "web_6_automail",
      entityType: "templates",
      seedValue: seed,
      limit: 5,
      method: "select",
    });
    if (Array.isArray(selected) && selected.length > 0) {
      return selected;
    }
  } catch (error) {
    console.warn("[automail] loadTemplatesFromDb failed:", error);
  }
  return [];
}

export { dynamicEmails as emails, dynamicTemplates as templates };
