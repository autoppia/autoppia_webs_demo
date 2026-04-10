import type { CommentEntry } from "@/components/books/CommentsPanel";
import {
  loadBookCommentsFromSession,
  saveBookCommentsToSession,
  sessionCommentsStorageKey,
} from "@/library/bookCommentsSession";

describe("bookCommentsSession", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("sessionCommentsStorageKey prefixes and encodes bookId", () => {
    expect(sessionCommentsStorageKey("b1")).toContain("b1");
    expect(sessionCommentsStorageKey("a/b")).toContain(encodeURIComponent("a/b"));
  });

  test("loadBookCommentsFromSession returns null when missing", () => {
    expect(loadBookCommentsFromSession("missing")).toBeNull();
  });

  test("loadBookCommentsFromSession returns null for invalid JSON", () => {
    sessionStorage.setItem(sessionCommentsStorageKey("bad"), "not-json");
    expect(loadBookCommentsFromSession("bad")).toBeNull();
  });

  test("loadBookCommentsFromSession returns null when JSON is not an array", () => {
    sessionStorage.setItem(sessionCommentsStorageKey("obj"), JSON.stringify({ a: 1 }));
    expect(loadBookCommentsFromSession("obj")).toBeNull();
  });

  test("saveBookCommentsToSession and load roundtrip", () => {
    const entries: CommentEntry[] = [
      {
        id: "c1",
        author: "Ada",
        message: "Great read",
        mood: "happy",
        avatar: "/a.png",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    saveBookCommentsToSession("book-99", entries);
    expect(loadBookCommentsFromSession("book-99")).toEqual(entries);
  });
});
