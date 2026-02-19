/**
 * Email validation and sanitization for robustness against malformed
 * or partial data from API/cache (edge cases).
 */

import type { Email, Label, Attachment } from "@/types/email";

const EMAIL_CATEGORIES = ["primary", "social", "promotions", "updates", "forums", "support"] as const;
const DEFAULT_CATEGORY = "primary";

function asString(value: unknown, fallback: string): string {
  if (value == null) return fallback;
  const s = String(value).trim();
  return s.length > 0 ? s : fallback;
}

function asNonEmptyString(value: unknown, fallback: string): string {
  const s = asString(value, fallback);
  return s.length > 0 ? s : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1) return true;
  if (value === "false" || value === 0) return false;
  return fallback;
}

function asDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number" && !Number.isNaN(value)) return new Date(value);
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function sanitizeLabel(raw: unknown): Label {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    id: asNonEmptyString(o.id, `label-${Math.random().toString(36).slice(2, 9)}`),
    name: asNonEmptyString(o.name, "Unnamed"),
    color: asNonEmptyString(o.color, "#6b7280"),
    type: o.type === "user" ? "user" : "system",
  };
}

function sanitizeLabels(raw: unknown): Label[] {
  if (!Array.isArray(raw)) return [];
  const out: Label[] = [];
  for (const item of raw) {
    try {
      out.push(sanitizeLabel(item));
    } catch {
      // skip invalid label
    }
  }
  return out;
}

function sanitizeAttachment(raw: unknown): Attachment | null {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const id = asNonEmptyString(o.id, "");
  const name = asNonEmptyString(o.name, "");
  if (!id || !name) return null;
  return {
    id,
    name,
    size: Math.max(0, asNumber(o.size, 0)),
    type: asNonEmptyString(o.type, "application/octet-stream"),
    url: asNonEmptyString(o.url, "#"),
  };
}

function sanitizeAttachments(raw: unknown): Attachment[] {
  if (!Array.isArray(raw)) return [];
  const out: Attachment[] = [];
  for (const item of raw) {
    const a = sanitizeAttachment(item);
    if (a) out.push(a);
  }
  return out;
}

function sanitizeRecipient(raw: unknown): { name: string; email: string } {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const email = asNonEmptyString(o.email, "unknown@local");
  const name = asNonEmptyString(o.name, email.split("@")[0] ?? "Unknown");
  return { name, email };
}

function sanitizeRecipients(raw: unknown): { name: string; email: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { name: string; email: string }[] = [];
  for (const item of raw) {
    try {
      const r = sanitizeRecipient(item);
      if (r.email && r.email !== "unknown@local") out.push(r);
    } catch {
      // skip
    }
  }
  return out;
}

/**
 * Sanitize a single raw object into an Email or return null if too invalid.
 */
export function sanitizeEmail(raw: unknown): Email | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const id = asNonEmptyString(o.id, "");
  if (!id) return null;

  const fromRaw = o.from;
  const fromObj = fromRaw && typeof fromRaw === "object" ? (fromRaw as Record<string, unknown>) : null;
  const from = fromObj
    ? {
        name: asNonEmptyString(fromObj.name, "Unknown"),
        email: asNonEmptyString(fromObj.email, "unknown@local"),
        avatar: typeof fromObj.avatar === "string" && fromObj.avatar.trim() ? fromObj.avatar.trim() : undefined,
      }
    : { name: "Unknown", email: "unknown@local" };

  const to = sanitizeRecipients(o.to);
  if (to.length === 0 && from.email) to.push({ name: from.name, email: from.email });

  const subject = asString(o.subject, "(No subject)");
  const body = asString(o.body, "");
  const snippet = asNonEmptyString(o.snippet, body.slice(0, 100) || "(No preview)");
  const category = EMAIL_CATEGORIES.includes((o.category as typeof EMAIL_CATEGORIES[number]) ?? "")
    ? (o.category as typeof EMAIL_CATEGORIES[number])
    : DEFAULT_CATEGORY;
  const threadId = asNonEmptyString(o.threadId, id);

  return {
    id,
    from,
    to,
    cc: sanitizeRecipients(o.cc),
    bcc: sanitizeRecipients(o.bcc),
    subject,
    body,
    htmlBody: typeof o.htmlBody === "string" && o.htmlBody.trim() ? o.htmlBody.trim() : undefined,
    snippet,
    timestamp: asDate(o.timestamp),
    isRead: asBoolean(o.isRead, false),
    isStarred: asBoolean(o.isStarred, false),
    isSnoozed: asBoolean(o.isSnoozed, false),
    isDraft: asBoolean(o.isDraft, false),
    isImportant: asBoolean(o.isImportant, false),
    labels: sanitizeLabels(o.labels),
    category,
    attachments: sanitizeAttachments(o.attachments),
    threadId,
  };
}

/**
 * Sanitize an array of raw items into Email[]. Skips invalid entries.
 */
export function sanitizeEmailList(raw: unknown): Email[] {
  if (!Array.isArray(raw)) return [];
  const out: Email[] = [];
  const seenIds = new Set<string>();
  for (const item of raw) {
    const email = sanitizeEmail(item);
    if (email && !seenIds.has(email.id)) {
      seenIds.add(email.id);
      out.push(email);
    }
  }
  return out;
}
