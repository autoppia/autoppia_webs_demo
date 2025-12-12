import type { Job, Post } from "@/library/dataset";

const SAVED_POSTS_KEY = "web9_saved_posts";
const HIDDEN_POSTS_KEY = "web9_hidden_posts";
const APPLIED_JOBS_KEY = "web9_applied_jobs";

export interface StoredAppliedJob {
  job: Job;
  appliedAt: string;
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
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((id) => typeof id === "string"));
    }
    return new Set();
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

export function persistAppliedJobs(
  applied: Record<string, StoredAppliedJob>
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(applied));
}
