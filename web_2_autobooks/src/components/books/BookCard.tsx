import type { Book } from "@/data/books";
import { SeedLink } from "@/components/ui/SeedLink";
import { useDynamicSystem } from "@/dynamic/shared";
import { cn } from "@/library/utils";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";

interface BookCardProps {
  book: Book;
  onSelect?: (book: Book) => void;
}

export function BookCard({ book, onSelect }: BookCardProps) {
  const dyn = useDynamicSystem();
  
  return (
    <>
      {dyn.v1.addWrapDecoy("book-card", (
        <div 
          id={dyn.v3.getVariant("book-card", ID_VARIANTS_MAP, "book-card")}
          className={cn(
            "group flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2",
            dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "")
          )}
        >
          <div
            className="aspect-[2/3] w-full max-w-[220px] mx-auto rounded-2xl bg-cover bg-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${book.poster}), url('/media/gallery/default_book.png')` }}
            aria-label={`${book.title} cover`}
          />

          <div className="mt-4 flex flex-1 flex-col gap-2">
            {dyn.v1.addWrapDecoy("book-meta", (
              <p className="text-xs uppercase tracking-wide text-white/50">
                {book.genres.slice(0, 2).join(" · ")} — {book.year}
              </p>
            ))}
            <h3 className="text-xl font-bold leading-tight group-hover:text-secondary transition-colors">
              <SeedLink href={`/books/${book.id}`} className="hover:underline">{book.title}</SeedLink>
            </h3>
            <p className="flex-1 text-sm text-white/80 leading-relaxed">{book.synopsis}</p>
            {dyn.v1.addWrapDecoy("book-tags", (
              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                <span className="rounded-full border border-white/15 px-3 py-1">{book.duration} pages</span>
                <span className="rounded-full border border-white/15 px-3 py-1">⭐ {book.rating}</span>
                <span className="rounded-full border border-white/15 px-3 py-1">{book.director}</span>
              </div>
            ))}
            <SeedLink
              href={`/books/${book.id}`}
              onClick={() => onSelect?.(book)}
              id={dyn.v3.getVariant("view-details-button", ID_VARIANTS_MAP, "view-details-button")}
              className={cn(
                "mt-4 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary hover:text-black hover:border-secondary hover:scale-105 shadow-lg",
                dyn.v3.getVariant("button", CLASS_VARIANTS_MAP, "")
              )}
            >
              {dyn.v3.getVariant("view_details", undefined, "View detail")}
            </SeedLink>
          </div>
        </div>
      ))}
    </>
  );
}

