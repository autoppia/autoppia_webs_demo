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
import { systemLabels as importedSystemLabels, userLabels as importedUserLabels } from "@/library/dataset";

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

/**
 * Initialize emails with data generation if enabled
 * Uses async calls for each category to avoid overwhelming the server
 */
export async function initializeEmails(): Promise<Email[]> {
  // Preserve existing behavior: use generation when enabled, else static data
  if (isDataGenerationAvailable()) {
    try {
      // Use cached emails on client to prevent re-generation on reloads
      const cached = readCachedEmails();
      if (cached && cached.length > 0) {
        dynamicEmails = normalizeEmailTimestamps(cached);
        return dynamicEmails;
      }

      console.log("🚀 Starting async email data generation for each category...");
      console.log("📡 Using API:", process.env.API_URL || "http://app:8090");

      // Define categories and emails per category
      const categories = DATA_GENERATION_CONFIG.AVAILABLE_CATEGORIES;
      const emailsPerCategory = DATA_GENERATION_CONFIG.DEFAULT_EMAILS_PER_CATEGORY;
      const delayBetweenCalls = DATA_GENERATION_CONFIG.DEFAULT_DELAY_BETWEEN_CALLS;

      console.log(`📊 Will generate ${emailsPerCategory} emails per category`);
      console.log(`🏷️  Categories: ${categories.join(", ")}`);

      // Generate emails for all categories with delays
      let allGeneratedEmails = await generateEmailsForCategories(
        categories,
        emailsPerCategory,
        delayBetweenCalls,
        originalEmails
      );

      // Normalize category field to one of the allowed categories
      const allowed = new Set(categories);
      allGeneratedEmails = allGeneratedEmails.map((e) => ({
        ...e,
        category: allowed.has(e.category || "") ? e.category : (e.category ? e.category : "primary"),
      }));

      // Normalize timestamps
      allGeneratedEmails = normalizeEmailTimestamps(allGeneratedEmails);

      dynamicEmails = allGeneratedEmails;
      // Cache generated emails on client
      writeCachedEmails(dynamicEmails);
      return dynamicEmails;
    } catch (error) {
      console.warn("⚠️ Failed to generate emails while generation is enabled. Keeping emails empty until ready. Error:", error);
      // When data generation is enabled, do NOT fall back to static data; return empty
      dynamicEmails = [];
      return dynamicEmails;
    }
  } else {
    console.log("ℹ️ Data generation is disabled, using original static emails");
    dynamicEmails = originalEmails;
    return dynamicEmails;
  }
}

// Runtime-only DB fetch for when DB mode is enabled
export async function loadEmailsFromDb(): Promise<Email[]> {
  if (!isDbLoadModeEnabled()) {
    return [];
  }
  
  try {
    const seed = getSeedValueFromEnv(1);
    const limit = 100;
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

      return normalizeEmailTimestamps(deduped);
    }
  } catch (e) {
    console.warn("Failed to load seeded email selection from DB:", e);
  }
  
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

