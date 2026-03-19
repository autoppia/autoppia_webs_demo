import type { Job, Post } from "@/library/dataset";

const SAVED_POSTS_KEY = "web9_saved_posts";
const HIDDEN_POSTS_KEY = "web9_hidden_posts";
const APPLIED_JOBS_KEY = "web9_applied_jobs";
const HIDDEN_POSTS_DATA_KEY = "web9_hidden_posts_data";

export const APPLICATION_STATUS_ORDER = [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_ORDER)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  rejected: "Rejected",
};

export interface StoredAppliedJob {
  job: Job;
  appliedAt: string;
  status?: ApplicationStatus;
  statusUpdatedAt?: string;
}

export function loadSavedPosts(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_POSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedPosts(posts: Post[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(posts));
}

export function loadHiddenPostIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(HIDDEN_POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((id: unknown) => typeof id === "string")
        : []
    );
  } catch {
    return new Set();
  }
}

export function persistHiddenPostIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    HIDDEN_POSTS_KEY,
    JSON.stringify(Array.from(ids))
  );
}

export function loadHiddenPosts(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HIDDEN_POSTS_DATA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistHiddenPosts(posts: Post[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HIDDEN_POSTS_DATA_KEY, JSON.stringify(posts));
}

export function loadAppliedJobs(): Record<string, StoredAppliedJob> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(APPLIED_JOBS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    (APPLICATION_STATUS_ORDER as readonly string[]).includes(value)
  );
}

export function normalizeAppliedJobs(
  applied: Record<string, StoredAppliedJob> | null | undefined
): Record<string, StoredAppliedJob> {
  if (!applied) return {};

  const normalized: Record<string, StoredAppliedJob> = {};

  for (const [jobId, value] of Object.entries(applied)) {
    if (!isRecord(value) || !isRecord(value.job)) continue;
    if (typeof value.appliedAt !== "string" || value.appliedAt.length === 0) continue;

    const status = isApplicationStatus(value.status) ? value.status : "applied";
    const statusUpdatedAt =
      typeof value.statusUpdatedAt === "string" && value.statusUpdatedAt.length > 0
        ? value.statusUpdatedAt
        : value.appliedAt;

    normalized[jobId] = {
      ...(value as StoredAppliedJob),
      status,
      statusUpdatedAt,
    };
  }

  return normalized;
}

export function loadNormalizedAppliedJobs(): Record<string, StoredAppliedJob> {
  return normalizeAppliedJobs(loadAppliedJobs());
}

export function persistAppliedJobs(
  applied: Record<string, StoredAppliedJob>
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(applied));
}
