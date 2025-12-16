import type { Book } from "@/data/books";
import { SeedLink } from "@/components/ui/SeedLink";
import { BookOpen, Star, ArrowRight } from "lucide-react";

interface MovieCardProps {
  movie: Book;
  onSelect?: (movie: Book) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <div className="group flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <div
          className="aspect-[2/3] w-full max-w-[220px] mx-auto rounded-2xl bg-cover bg-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${movie.poster}), url('/media/gallery/default_book.png')` }}
          aria-label={`${movie.title} cover`}
        />
        {/* Rating badge overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/20">
          <Star className="h-3 w-3 fill-secondary text-secondary" />
          <span className="text-xs font-bold text-white">{movie.rating}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-white/50 font-medium">
            {movie.genres.slice(0, 2).join(" · ") || "General"}
          </p>
          <p className="text-xs text-white/40">{movie.year}</p>
        </div>
        
        <h3 className="text-xl font-bold leading-tight group-hover:text-secondary transition-colors line-clamp-2">
          <SeedLink href={`/books/${movie.id}`} className="hover:underline">{movie.title}</SeedLink>
        </h3>
        
        <p className="flex-1 text-sm text-white/80 leading-relaxed line-clamp-3">{movie.synopsis}</p>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <BookOpen className="h-3 w-3 text-secondary" />
            <span className="text-white/90 font-medium">{movie.duration} pages</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-white/90 font-medium">{movie.director}</span>
          </span>
          {typeof movie.price === "number" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/20 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-secondary font-bold">${movie.price.toFixed(2)}</span>
            </span>
          )}
        </div>
        
        <SeedLink
          href={`/books/${movie.id}`}
          onClick={() => onSelect?.(movie)}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-secondary hover:text-black hover:border-secondary hover:scale-105 shadow-lg group-hover:shadow-secondary/30"
        >
          View details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </SeedLink>
      </div>
    </div>
  );
}
