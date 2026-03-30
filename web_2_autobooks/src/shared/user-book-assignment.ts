/**
 * Deterministic user → primary allowed book assignment for the current catalog.
 *
 * Contract:
 * - `books` is the ordered list from `/datasets/load` for the active seed (same order as `getBooks()`).
 * - `userK` → user index `K - 1`; any other username → sum of char codes (stable, reproducible).
 * - Primary book id = `books[userIndex % N].id` when N > 0.
 * - No fallback ids: empty catalog yields null / [].
 */

export const BOOK_LIBRARY_UNAVAILABLE = "Book library is not available.";

export function getDeterministicUserIndex(username: string): number {
  const match = /^user(\d+)$/i.exec(username.trim());
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed - 1;
    }
  }

  return Array.from(username).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function resolvePrimaryAllowedBookId(
  books: { id: string }[],
  username: string,
): string | null {
  if (!books.length) {
    return null;
  }

  const userIndex = getDeterministicUserIndex(username);
  const bookIndex = ((userIndex % books.length) + books.length) % books.length;
  const selected = books[bookIndex];
  return selected?.id ?? null;
}

export function resolvePrimaryAllowedBooks(
  books: { id: string }[],
  username: string,
): string[] {
  const id = resolvePrimaryAllowedBookId(books, username);
  return id ? [id] : [];
}
