import { describe, expect, test } from "bun:test";
import {
  isNonEmptyTrimmed,
  isValidRecipientEmail,
  validateShareRecipientInput,
} from "../src/library/shareValidation";
import {
  FAMOUS_LIBRARIES,
  filterLibrariesByLocationQuery,
  normalizeLocationQuery,
} from "../src/data/libraries";
import {
  AUTHOR_PROFILES,
  booksForAuthor,
  directorMatchesAuthor,
  getAuthorById,
  normalizeDirectorLabel,
} from "../src/data/authors";
import type { Book } from "../src/data/books";

describe("shareValidation", () => {
  test("isNonEmptyTrimmed rejects whitespace-only", () => {
    expect(isNonEmptyTrimmed("   ")).toBe(false);
    expect(isNonEmptyTrimmed("\t\n")).toBe(false);
  });

  test("isNonEmptyTrimmed accepts trimmed content", () => {
    expect(isNonEmptyTrimmed("  Ada  ")).toBe(true);
  });

  test("isValidRecipientEmail accepts common formats", () => {
    expect(isValidRecipientEmail("reader@example.com")).toBe(true);
    expect(isValidRecipientEmail("  a@b.co  ")).toBe(true);
  });

  test("isValidRecipientEmail rejects missing or invalid", () => {
    expect(isValidRecipientEmail("")).toBe(false);
    expect(isValidRecipientEmail("not-an-email")).toBe(false);
    expect(isValidRecipientEmail("@nodomain.com")).toBe(false);
  });

  test("validateShareRecipientInput fails when name empty", () => {
    const r = validateShareRecipientInput("  ", "valid@email.com");
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  test("validateShareRecipientInput fails when email invalid", () => {
    const r = validateShareRecipientInput("Jordan", "bad");
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  test("validateShareRecipientInput returns trimmed fields when valid", () => {
    const r = validateShareRecipientInput("  Sam  ", "  sam@books.test  ");
    expect(r.ok).toBe(true);
    expect(r.recipientName).toBe("Sam");
    expect(r.recipientEmail).toBe("sam@books.test");
    expect(r.error).toBeNull();
  });
});

describe("libraries location search", () => {
  test("normalizeLocationQuery collapses whitespace and lowercases", () => {
    expect(normalizeLocationQuery("  New   York  ")).toBe("new york");
  });

  test("filterLibrariesByLocationQuery returns full list for empty query", () => {
    const all = filterLibrariesByLocationQuery(FAMOUS_LIBRARIES, "");
    expect(all.length).toBe(FAMOUS_LIBRARIES.length);
  });

  test("filterLibrariesByLocationQuery matches city substring", () => {
    const found = filterLibrariesByLocationQuery(FAMOUS_LIBRARIES, "Paris");
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((l) => `${l.name} ${l.city} ${l.country}`.toLowerCase().includes("paris"))).toBe(
      true
    );
  });

  test("filterLibrariesByLocationQuery returns empty when nothing matches", () => {
    const found = filterLibrariesByLocationQuery(FAMOUS_LIBRARIES, "zzzz-no-match-zzzz");
    expect(found).toEqual([]);
  });
});

describe("authors", () => {
  test("getAuthorById resolves known slug", () => {
    const a = getAuthorById("homer");
    expect(a?.displayName).toBe("Homer");
  });

  test("getAuthorById returns undefined for unknown slug", () => {
    expect(getAuthorById("unknown-author-slug")).toBeUndefined();
  });

  test("normalizeDirectorLabel handles unicode names consistently", () => {
    const a = "Gabriel García Márquez";
    const b = "Gabriel García Márquez".normalize("NFC");
    expect(normalizeDirectorLabel(a)).toBe(normalizeDirectorLabel(b));
  });

  test("directorMatchesAuthor matches alias list", () => {
    const author = AUTHOR_PROFILES.find((x) => x.id === "gabriel-garcia-marquez");
    expect(author).toBeDefined();
    if (!author) return;
    expect(directorMatchesAuthor("Gabriel García Márquez", author)).toBe(true);
    expect(directorMatchesAuthor("Gabriel Garcia Marquez", author)).toBe(true);
    expect(directorMatchesAuthor("Someone Else", author)).toBe(false);
  });

  test("booksForAuthor filters by director field", () => {
    const author = getAuthorById("homer");
    expect(author).toBeDefined();
    if (!author) return;
    const mockBooks: Book[] = [
      {
        id: "x1",
        title: "The Odyssey",
        synopsis: "Epic",
        year: -800,
        duration: 400,
        rating: 4.5,
        director: "Homer",
        cast: [],
        poster: "/x.webp",
        genres: ["Epic"],
        category: "Classic",
      },
      {
        id: "x2",
        title: "Other",
        synopsis: "Other",
        year: 2000,
        duration: 200,
        rating: 4,
        director: "Other Author",
        cast: [],
        poster: "/y.webp",
        genres: ["Fiction"],
        category: "Fiction",
      },
    ];
    const bib = booksForAuthor(mockBooks, author);
    expect(bib.map((b) => b.id)).toEqual(["x1"]);
  });
});
