// Unit tests for building the book event payload.
import { buildBookDetailPayload } from "@/library/bookEventPayload";
import type { Book } from "@/data/books";

describe("bookEventPayload (autobooks)", () => {
  test("buildBookDetailPayload maps Book to payload correctly", () => {
    const book: Book = {
      id: "book-123",
      title: "Clean Code",
      synopsis: "A book about writing clean code",
      year: 2008,
      duration: 464,
      rating: 4.8,
      director: "Robert C. Martin",
      cast: [],
      poster: "/media/gallery/clean_code.png",
      genres: ["Programming", "Software"],
      category: "Tech",
    };

    const payload = buildBookDetailPayload(book);
    expect(payload).toEqual({
      name: "Clean Code",
      year: 2008,
      genres: ["Programming", "Software"],
      rating: 4.8,
      book_id: "book-123",
    });
  });
}
);
