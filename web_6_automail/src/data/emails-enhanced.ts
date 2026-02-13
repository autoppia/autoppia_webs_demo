/**
 * Enhanced Emails Data with AI Generation Support
 * 
 * This file provides both static and dynamic email data generation
 * for the AutoMail email client application.
 */

import type { Email, Label } from "@/types/email";
import { readJson, writeJson } from "@/shared/storage";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { clampBaseSeed } from "@/shared/seed-resolver";
import fallbackEmails from "./original/emails_1.json";

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
let dynamicEmails: Email[] = [...originalEmails];

// Client-side cache to avoid regenerating on every reload
export function readCachedEmails(): Email[] | null {
  const cached = readJson<Email[]>("automail_generated_emails_v1", null);
  return cached ? normalizeEmailTimestamps(cached) : null;
}

export function writeCachedEmails(emailsToCache: Email[]): void {
  writeJson("automail_generated_emails_v1", emailsToCache);
}

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

const resolveSeed = (seedOverride?: number | null): number => {
  const baseSeed = getBaseSeedFromUrl();
  return clampBaseSeed(seedOverride ?? baseSeed ?? 1);
};

/**
 * Initialize emails with V2 system (DB mode or fallback)
 */
export async function initializeEmails(seedOverride?: number | null): Promise<Email[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(seedOverride);

  if (effectiveSeed === 1) {
    if (dbModeEnabled) {
      console.log("[automail] Base seed is 1, using original data (skipping DB mode)");
    }
    dynamicEmails = normalizeEmailTimestamps(fallbackEmails as Email[]);
    return dynamicEmails;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[automail] DB mode enabled, attempting to load from DB...");
    console.log("[automail] effectiveSeed:", effectiveSeed);

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
  
  const seed = resolveSeed(seedOverride);
  console.log("[automail] loadEmailsFromDb - seedOverride:", seedOverride, "final seed:", seed);

  if (seed === 1) {
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

// Export the dynamic emails array for direct access
export { dynamicEmails as emails };
