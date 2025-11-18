import type { Book } from "@/data/books";
import { SeedLink } from "@/components/ui/SeedLink";

interface RelatedBooksProps {
  books: Book[];
  title?: string;
}

export function RelatedBooks({ books, title = "Related books" }: RelatedBooksProps) {
  if (!books.length) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {books.map((book) => (
          <div key={book.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black/40 p-4">
            <div
              className="h-24 w-24 flex-shrink-0 rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${book.poster})` }}
            />
            <div>
              <p className="text-xs uppercase text-white/50">{book.genres[0] || "Genre"}</p>
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-white/70">{book.year} · {book.duration} pages</p>
              <SeedLink href={`/books/${book.id}`} className="mt-2 inline-flex text-xs uppercase tracking-wide text-secondary">
                View detail →
              </SeedLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
