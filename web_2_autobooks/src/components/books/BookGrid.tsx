import type { Book } from "@/data/books";
import { BookCard } from "./BookCard";

interface BookGridProps {
  books: Book[];
  onSelectBook?: (book: Book) => void;
  layoutClass?: string;
}

export function BookGrid({ books, onSelectBook, layoutClass }: BookGridProps) {
  if (!books.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center text-white/70">
        No books found. Try a different genre or year.
      </div>
    );
  }

  // Always use 3 columns on large screens, ignore layout variants
  // Force grid layout regardless of layoutClass prop
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onSelect={onSelectBook} />
      ))}
    </div>
  );
}

