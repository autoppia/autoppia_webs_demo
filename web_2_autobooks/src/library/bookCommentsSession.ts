import type { CommentEntry } from "@/components/books/CommentsPanel";

const STORAGE_PREFIX = "autobooks_reader_notes_v1:";

export function sessionCommentsStorageKey(bookId: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(bookId)}`;
}

export function loadBookCommentsFromSession(bookId: string): CommentEntry[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(sessionCommentsStorageKey(bookId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as CommentEntry[];
  } catch {
    return null;
  }
}

export function saveBookCommentsToSession(bookId: string, comments: CommentEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(sessionCommentsStorageKey(bookId), JSON.stringify(comments));
  } catch {
    /* quota or private mode */
  }
}
