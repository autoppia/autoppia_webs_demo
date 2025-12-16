import type { Book } from "@/data/books";
import { SeedLink } from "@/components/ui/SeedLink";
import { BookOpen, ArrowRight, Star } from "lucide-react";

interface RelatedBooksProps {
  books: Book[];
  title?: string;
}

export function RelatedBooks({ books, title = "Related books" }: RelatedBooksProps) {
  if (!books.length) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl text-white">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-5 w-5 text-secondary" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {books.map((book) => (
          <SeedLink
            key={book.id}
            href={`/books/${book.id}`}
            className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-secondary/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1"
          >
            <div className="relative overflow-hidden">
              <div
                className="aspect-[2/3] w-full rounded-xl bg-cover bg-center shadow-xl transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${book.poster}), url('/media/gallery/default_book.png')` }}
              />
              {/* Rating badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2 py-1 border border-white/20">
                <Star className="h-2.5 w-2.5 fill-secondary text-secondary" />
                <span className="text-xs font-bold text-white">{book.rating}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1">{book.genres[0] || "Genre"}</p>
              <h3 className="text-base font-bold line-clamp-2 group-hover:text-secondary transition-colors">{book.title}</h3>
              <p className="text-xs text-white/60">{book.year} · {book.duration} pages</p>
              <div className="flex items-center gap-1.5 mt-auto text-xs font-semibold text-secondary group-hover:gap-2 transition-all">
                View detail <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </SeedLink>
        ))}
      </div>
    </section>
  );
}
