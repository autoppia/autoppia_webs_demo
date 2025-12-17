import type { Book } from "@/data/books";

export interface BookDetailPayload {
  name: string;
  year: number;
  genres: string[];
  rating: number;
  book_id: string;
}

export function buildBookDetailPayload(book: Book): BookDetailPayload {
  return {
    name: book.title,
    year: book.year,
    genres: book.genres,
    rating: book.rating,
    book_id: book.id,
  };
}

