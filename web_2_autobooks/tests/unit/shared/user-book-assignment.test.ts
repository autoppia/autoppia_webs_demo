import {
  BOOK_LIBRARY_UNAVAILABLE,
  getDeterministicUserIndex,
  resolvePrimaryAllowedBookId,
  resolvePrimaryAllowedBooks,
} from "@/shared/user-book-assignment";

describe("user-book-assignment", () => {
  test("BOOK_LIBRARY_UNAVAILABLE is a non-empty message", () => {
    expect(BOOK_LIBRARY_UNAVAILABLE).toContain("not available");
  });

  test("getDeterministicUserIndex parses userN as N-1", () => {
    expect(getDeterministicUserIndex("user1")).toBe(0);
    expect(getDeterministicUserIndex("USER256")).toBe(255);
    expect(getDeterministicUserIndex("  user42  ")).toBe(41);
  });

  test("getDeterministicUserIndex uses char sum when not userN pattern", () => {
    expect(getDeterministicUserIndex("alice")).toBe(
      "alice".split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    );
  });

  test("getDeterministicUserIndex treats user0 and invalid numeric as char sum", () => {
    expect(getDeterministicUserIndex("user0")).not.toBe(-1);
    expect(getDeterministicUserIndex("user0")).toBe(
      Array.from("user0").reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    );
  });

  test("resolvePrimaryAllowedBookId returns null for empty catalog", () => {
    expect(resolvePrimaryAllowedBookId([], "user1")).toBeNull();
  });

  test("resolvePrimaryAllowedBookId maps user index modulo length", () => {
    const books = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(resolvePrimaryAllowedBookId(books, "user1")).toBe("a");
    expect(resolvePrimaryAllowedBookId(books, "user2")).toBe("b");
    expect(resolvePrimaryAllowedBookId(books, "user4")).toBe("a");
  });

  test("resolvePrimaryAllowedBookId returns empty string when selected slot has empty id", () => {
    const books = [{ id: "" }, { id: "b" }];
    expect(resolvePrimaryAllowedBookId(books, "user1")).toBe("");
  });

  test("resolvePrimaryAllowedBooks wraps id or empty array", () => {
    expect(resolvePrimaryAllowedBooks([{ id: "x" }], "user1")).toEqual(["x"]);
    expect(resolvePrimaryAllowedBooks([], "user1")).toEqual([]);
  });

  test("resolvePrimaryAllowedBooks returns empty when id is empty string", () => {
    expect(resolvePrimaryAllowedBooks([{ id: "" }], "user1")).toEqual([]);
  });
});
