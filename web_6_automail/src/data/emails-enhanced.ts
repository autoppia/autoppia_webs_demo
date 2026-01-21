/**
 * Enhanced Emails Data with AI Generation Support
 * 
 * This file provides both static and dynamic email data generation
 * for the AutoMail email client application.
 */

import type { Email, Label } from "@/types/email";
import { readJson, writeJson } from "@/shared/storage";
import { 
  generateEmailsWithFallback, 
  replaceAllEmails, 
  addGeneratedEmails,
  isDataGenerationAvailable 
} from "@/utils/emailDataGenerator";
import { fetchSeededSelection, getSeedValueFromEnv, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { getApiBaseUrl } from "@/shared/data-generator";
import { systemLabels as importedSystemLabels, userLabels as importedUserLabels } from "@/library/dataset";
import fallbackEmails from "./original/emails_1.json";

// Re-export labels from dataset
export const systemLabels: Label[] = importedSystemLabels;
export const userLabels: Label[] = importedUserLabels;

// Helper function to normalize email timestamps
function normalizeEmailTimestamps(emails: Email[]): Email[] {
  return emails.map((email) => ({
    ...email,
    timestamp: typeof email.timestamp === 'string' 
      ? new Date(email.timestamp) 
      : email.timestamp,
  }));
}

// Original static emails (from dataset)
export const originalEmails: Email[] = [
  {
    id: "email1",
    from: {
      name: "Alice Smith",
      email: "alice.smith@company.com",
      avatar: "https://example.com/avatars/alice.jpg",
    },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Project Kickoff Meeting",
    body: "Dear Me,\n\nLooking forward to our project kickoff meeting next week. Please review the attached agenda.\n\nBest,\nAlice",
    snippet: "Looking forward to our project kickoff meeting next week...",
    timestamp: new Date("2025-07-08T10:00:00Z"),
    isRead: true,
    isStarred: false,
    isSnoozed: false,
    isDraft: false,
    isImportant: true,
    labels: [{ id: "work", name: "Work", color: "#4285f4", type: "user" }],
    category: "primary",
    threadId: "thread1",
    attachments: [
      {
        id: "attach1",
        name: "agenda.pdf",
        size: 1048576,
        type: "application/pdf",
        url: "https://example.com/agenda.pdf",
      },
    ],
  },
  {
    id: "email2",
    from: {
      name: "Bob Johnson",
      email: "bob.johnson@tech.org",
      avatar: "https://example.com/avatars/bob.jpg",
    },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Lunch Plans",
    body: "Hey,\n\nWant to grab lunch this Friday? Let me know what works for you!\n\nCheers,\nBob",
    snippet: "Want to grab lunch this Friday?...",
    timestamp: new Date("2025-07-07T12:30:00Z"),
    isRead: false,
    isStarred: true,
    isSnoozed: false,
    isDraft: false,
    isImportant: false,
    labels: [
      { id: "personal", name: "Personal", color: "#0f9d58", type: "user" },
    ],
    category: "social",
    threadId: "thread2",
  },
  {
    id: "email3",
    from: { name: "Carol White", email: "carol.white@outlook.com" },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Newsletter Subscription",
    body: "Dear Me,\n\nThank you for subscribing to our newsletter! Here are the latest updates.\n\nBest,\nCarol",
    snippet: "Thank you for subscribing to our newsletter!...",
    timestamp: new Date("2025-07-06T09:15:00Z"),
    isRead: true,
    isStarred: false,
    isSnoozed: false,
    isDraft: false,
    isImportant: false,
    labels: [],
    category: "promotions",
    threadId: "thread3",
  },
  {
    id: "email4",
    from: { name: "David Brown", email: "david.brown@company.com" },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Q2 Report Feedback",
    body: "Hi,\n\nPlease review the Q2 report and share your feedback by EOD.\n\nThanks,\nDavid",
    snippet: "Please review the Q2 report and share your feedback...",
    timestamp: new Date("2025-07-05T14:20:00Z"),
    isRead: false,
    isStarred: false,
    isSnoozed: true,
    isDraft: false,
    isImportant: true,
    labels: [{ id: "work", name: "Work", color: "#4285f4", type: "user" }],
    category: "primary",
    threadId: "thread4",
  },
  {
    id: "email5",
    from: { name: "Emma Davis", email: "emma.davis@yahoo.com" },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Community Forum Update",
    body: "Hello,\n\nThere's a new reply to your post in the community forum.\n\nRegards,\nEmma",
    snippet: "There's a new reply to your post in the community forum...",
    timestamp: new Date("2025-07-04T11:45:00Z"),
    isRead: true,
    isStarred: false,
    isSnoozed: false,
    isDraft: false,
    isImportant: false,
    labels: [],
    category: "forums",
    threadId: "thread5",
  },
  {
    id: "email6",
    from: { name: "Frank Wilson", email: "frank.wilson@startup.io" },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Support Ticket #1234",
    body: "Dear Me,\n\nYour support ticket has been resolved. Please let us know if you need further assistance.\n\nBest,\nFrank",
    snippet: "Your support ticket has been resolved...",
    timestamp: new Date("2025-07-03T16:00:00Z"),
    isRead: true,
    isStarred: false,
    isSnoozed: false,
    isDraft: false,
    isImportant: false,
    labels: [],
    category: "support",
    threadId: "thread6",
  },
  {
    id: "email7",
    from: { name: "Grace Lee", email: "grace.lee@gmail.com" },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Weekend Plans",
    body: "Hi,\n\nWhat are your plans for the weekend? Let's catch up!\n\nGrace",
    snippet: "What are your plans for the weekend?...",
    timestamp: new Date("2025-07-02T18:00:00Z"),
    isRead: true,
    isStarred: false,
    isSnoozed: false,
    isDraft: false,
    isImportant: false,
    labels: [
      { id: "personal", name: "Personal", color: "#0f9d58", type: "user" },
    ],
    category: "social",
    threadId: "thread7",
  },
  {
    id: "email8",
    from: { name: "Henry Adams", email: "henry.adams@deals.com" },
    to: [{ name: "Me", email: "me@gmail.com" }],
    subject: "Special Offer: 50% Off!",
    body: "Dear Me,\n\nDon't miss our biggest sale of the year! 50% off on all items.\n\nShop Now,\nHenry",
    snippet: "Don't miss our biggest sale of the year!...",
    timestamp: new Date("2025-07-01T08:00:00Z"),
    isRead: false,
    isStarred: false,
    isSnoozed: false,
    isDraft: false,
    isImportant: false,
    labels: [],
    category: "promotions",
    threadId: "thread8",
  },
];

// Dynamic emails array that can be populated with generated data
let dynamicEmails: Email[] = isDataGenerationAvailable() ? [] : [...originalEmails];

// Client-side cache to avoid regenerating on every reload
export function readCachedEmails(): Email[] | null {
  const cached = readJson<Email[]>("automail_generated_emails_v1", null);
  return cached ? normalizeEmailTimestamps(cached) : null;
}

export function writeCachedEmails(emailsToCache: Email[]): void {
  writeJson("automail_generated_emails_v1", emailsToCache);
}

// Configuration for async data generation
const DATA_GENERATION_CONFIG = {
  // Default delay between category calls (in milliseconds)
  DEFAULT_DELAY_BETWEEN_CALLS: 1000,
  // Default emails per category
  DEFAULT_EMAILS_PER_CATEGORY: 8,
  // Maximum retry attempts for failed category generation
  MAX_RETRY_ATTEMPTS: 2,
  // Available categories for data generation
  AVAILABLE_CATEGORIES: ["primary", "social", "promotions", "updates", "forums", "support"]
};

/**
 * Utility function to generate emails for multiple categories with delays
 * Prevents server overload by spacing out API calls
 */
async function generateEmailsForCategories(
  categories: string[],
  emailsPerCategory: number,
  delayBetweenCalls: number = 200,
  existingEmails: Email[] = []
): Promise<Email[]> {
  let allGeneratedEmails: Email[] = [];

  // Bounded concurrency (e.g., 3 at a time)
  const concurrencyLimit = 3;
  let index = 0;

  async function worker() {
    while (index < categories.length) {
      const currentIndex = index++;
      const category = categories[currentIndex];
      try {
        console.log(`Generating ${emailsPerCategory} emails for ${category}...`);
        const categoryEmails = await generateEmailsWithFallback(
          [],
          emailsPerCategory,
          [category]
        );
        allGeneratedEmails = [...allGeneratedEmails, ...categoryEmails];
        console.log(`✅ Generated ${categoryEmails.length} emails for ${category}`);
      } catch (categoryError) {
        console.warn(`Failed to generate emails for ${category}:`, categoryError);
      }
      // small gap to avoid burst
      if (currentIndex < categories.length - 1 && delayBetweenCalls > 0) {
        await new Promise((r) => setTimeout(r, delayBetweenCalls));
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrencyLimit, categories.length) }, () => worker());
  await Promise.all(workers);

  if (allGeneratedEmails.length > 0) {
    return allGeneratedEmails;
  } else {
    console.warn('No emails were generated for any category, returning existing emails.');
    return existingEmails;
  }
}

const clampSeed = (value: number, fallback = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) {
      return clampBaseSeed(parsed);
    }
  }
  return null;
};

const resolveSeed = (dbModeEnabled: boolean, seedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampSeed(seedValue);
  }
  
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    const resolvedSeeds = resolveSeedsSync(baseSeed);
    if (resolvedSeeds.v2 !== null) {
      return resolvedSeeds.v2;
    }
    return clampSeed(baseSeed);
  }
  
  return 1;
};

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__automailV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

/**
 * Fetch AI generated emails from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedEmails(count: number): Promise<any[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[automail] fetchAiGeneratedEmails - URL:", url, "count:", count);
  
  try {
    console.log("[automail] Sending AI generation request...");
    const requestBody = {
      project_key: "web_6_automail",
      entity_type: "emails",
      count: 50, // Fixed count of 50
    };
    console.log("[automail] Request body:", requestBody);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[automail] AI generation response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("[automail] AI generation request failed - Status:", response.status, "Error:", errorText);
      throw new Error(`AI generation request failed: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    console.log("[automail] Parsing AI generation response...");
    const result = await response.json();
    console.log("[automail] AI generation response keys:", Object.keys(result));
    
    const generatedData = result?.generated_data ?? [];
    console.log("[automail] Generated data length:", generatedData.length, "isArray:", Array.isArray(generatedData));
    
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[automail] Invalid generated data:", generatedData);
      throw new Error("No data returned from AI generation endpoint");
    }

    console.log("[automail] Successfully fetched", generatedData.length, "emails from AI generation");
    return generatedData;
  } catch (error) {
    console.error("[automail] AI generation failed with error:", error);
    if (error instanceof Error) {
      console.error("[automail] Error message:", error.message);
      console.error("[automail] Error stack:", error.stack);
    }
    throw error;
  }
}

/**
 * Initialize emails with V2 system (DB mode, AI generation, or fallback)
 */
export async function initializeEmails(v2SeedValue?: number | null): Promise<Email[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[automail] initializeEmails - dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled, "v2SeedValue:", v2SeedValue);
  
  // Get base seed from URL to check if seed = 1
  const baseSeed = getBaseSeedFromUrl();
  
  // Check if seed = 1 - if so, use original data for both DB and AI modes
  // Also check v2SeedValue directly if provided (from data-provider)
  if (baseSeed === 1 || v2SeedValue === 1) {
    if (dbModeEnabled || aiGenerateEnabled) {
      console.log("[automail] Base seed is 1, using original data (skipping DB/AI modes)");
      dynamicEmails = normalizeEmailTimestamps(fallbackEmails as Email[]);
      return dynamicEmails;
    }
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[automail] DB mode enabled, attempting to load from DB...");
    console.log("[automail] baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue);
    
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);
    console.log("[automail] Effective seed for DB load:", effectiveSeed);

    try {
      console.log("[automail] Calling fetchSeededSelection with:", {
        projectKey: "web_6_automail",
        entityType: "emails",
        seedValue: effectiveSeed,
        limit: 50,
        method: "distribute",
        filterKey: "category",
      });
      
      const emails = await fetchSeededSelection<Email>({
        projectKey: "web_6_automail",
        entityType: "emails",
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "distribute",
        filterKey: "category",
      });

      console.log("[automail] fetchSeededSelection returned:", emails?.length, "emails");
      console.log("[automail] First few emails:", emails?.slice(0, 3));

      if (Array.isArray(emails) && emails.length > 0) {
        console.log(
          `[automail] ✅ Successfully loaded ${emails.length} emails from dataset (seed=${effectiveSeed})`
        );
        dynamicEmails = normalizeEmailTimestamps(emails);
        return dynamicEmails;
      }

      console.warn(`[automail] ⚠️ No emails returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.error("[automail] ❌ Backend unavailable, falling back to local JSON. Error:", error);
      if (error instanceof Error) {
        console.error("[automail] Error message:", error.message);
        console.error("[automail] Error stack:", error.stack);
      }
    }
  }
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  // Only try AI generation if DB mode is not enabled (AI is fallback when DB is off)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      console.log("[automail] AI generation mode enabled, generating emails...");
      const generatedEmails = await fetchAiGeneratedEmails(50);
      console.log("[automail] fetchAiGeneratedEmails returned:", generatedEmails?.length, "emails");
      
      if (Array.isArray(generatedEmails) && generatedEmails.length > 0) {
        console.log(`[automail] Generated ${generatedEmails.length} emails via AI`);
        dynamicEmails = normalizeEmailTimestamps(generatedEmails as Email[]);
        console.log("[automail] Normalized emails count:", dynamicEmails.length);
        return dynamicEmails;
      }
      
      console.warn("[automail] No emails generated, falling back to local JSON. generatedEmails:", generatedEmails);
    } catch (error) {
      console.error("[automail] AI generation failed, falling back to local JSON. Error details:", error);
      if (error instanceof Error) {
        console.error("[automail] Error message:", error.message);
        console.error("[automail] Error stack:", error.stack);
      }
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[automail] V2 modes disabled, loading from local JSON");
  }

  // Fallback to local JSON
  dynamicEmails = normalizeEmailTimestamps(fallbackEmails as Email[]);
  return dynamicEmails;
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadEmailsFromDb(seedOverride?: number | null): Promise<Email[]> {
  if (!isDbLoadModeEnabled()) {
    console.log("[automail] loadEmailsFromDb: DB mode not enabled, returning empty array");
    return [];
  }
  
  // Check base seed from URL - if seed = 1, return empty array to trigger fallback
  const baseSeed = getBaseSeedFromUrl();
  const fallbackSeed = getSeedValueFromEnv(1);
  const seed = (typeof seedOverride === "number" && seedOverride > 0) ? seedOverride : fallbackSeed;
  
  console.log("[automail] loadEmailsFromDb - baseSeed:", baseSeed, "seedOverride:", seedOverride, "final seed:", seed);
  
  // If seed = 1, return empty array so initializeEmails will use fallback data
  if (baseSeed === 1 || seed === 1) {
    console.log("[automail] loadEmailsFromDb: seed is 1, returning empty array to use fallback data");
    return [];
  }
  
  try {
    const limit = 50; // Fixed limit of 50 items
    console.log("[automail] loadEmailsFromDb: Fetching from server with seed:", seed, "limit:", limit);
    // Prefer distributed selection to avoid category dominance (e.g., primary only)
      const distributed = await fetchSeededSelection<Email>({
      projectKey: "web_6_automail",
      entityType: "emails",
      seedValue: seed,
      limit,
      method: "distribute",
      filterKey: "category",
    });
    const selected = Array.isArray(distributed) && distributed.length > 0 ? distributed : await fetchSeededSelection<Email>({
      projectKey: "web_6_automail",
      entityType: "emails",
      seedValue: seed,
      limit,
      method: "select",
    });
    if (selected && selected.length > 0) {
      // Ensure we have at least some items for all primary categories by supplementing with originals if needed
      const categories = ["primary", "social", "promotions", "updates", "forums", "support"];
      const byCategory: Record<string, Email[]> = {};
      for (const e of selected) {
        const cat = e.category || "primary";
        byCategory[cat] = byCategory[cat] || [];
        byCategory[cat].push(e);
      }

      // Pull minimal items from originals to fill missing categories
      const supplemented: Email[] = [...selected];
      for (const cat of categories) {
        if (!byCategory[cat] || byCategory[cat].length === 0) {
          const fallback = originalEmails.filter((e) => e.category === cat).slice(0, 4);
          if (fallback.length > 0) {
            supplemented.push(...fallback);
          }
        }
      }

      // Deduplicate by id
      const seen = new Set<string>();
      const deduped = supplemented.filter((e) => {
        const id = e.id || `${e.subject}-${e.category}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      console.log("[automail] loadEmailsFromDb: ✅ Successfully loaded", deduped.length, "emails from DB");
      return normalizeEmailTimestamps(deduped);
    } else {
      console.warn("[automail] loadEmailsFromDb: ⚠️ No emails selected from DB (selected length:", selected?.length, ")");
    }
  } catch (e) {
    console.error("[automail] loadEmailsFromDb: ❌ Failed to load seeded email selection from DB:", e);
    if (e instanceof Error) {
      console.error("[automail] Error message:", e.message);
      console.error("[automail] Error stack:", e.stack);
    }
  }
  
  console.log("[automail] loadEmailsFromDb: Returning empty array");
  return [];
}

/**
 * Get emails by category
 */
export function getEmailsByCategory(category: string): Email[] {
  return dynamicEmails.filter((email) => email.category === category);
}

/**
 * Get an email by ID
 */
export function getEmailById(id: string): Email | undefined {
  return dynamicEmails.find((email) => email.id === id);
}

/**
 * Get unread emails
 */
export function getUnreadEmails(): Email[] {
  return dynamicEmails.filter((email) => !email.isRead);
}

/**
 * Get starred emails
 */
export function getStarredEmails(): Email[] {
  return dynamicEmails.filter((email) => email.isStarred);
}

/**
 * Reset to original emails only
 */
export function resetToOriginalEmails(): void {
  dynamicEmails = [...originalEmails];
}

/**
 * Get statistics about current emails
 */
export function getEmailStats() {
  const categories = dynamicEmails.reduce((acc, email) => {
    const category = email.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEmails: dynamicEmails.length,
    originalEmails: originalEmails.length,
    generatedEmails: dynamicEmails.length - originalEmails.length,
    unreadCount: dynamicEmails.filter(e => !e.isRead).length,
    starredCount: dynamicEmails.filter(e => e.isStarred).length,
    categories,
  };
}

/**
 * Search emails by query
 */
export function searchEmails(query: string): Email[] {
  const lowercaseQuery = query.toLowerCase();
  return dynamicEmails.filter((email) =>
    email.subject.toLowerCase().includes(lowercaseQuery) ||
    email.body?.toLowerCase().includes(lowercaseQuery) ||
    email.from.name?.toLowerCase().includes(lowercaseQuery) ||
    email.from.email?.toLowerCase().includes(lowercaseQuery)
  );
}

// Export the dynamic emails array for direct access
export { dynamicEmails as emails };
