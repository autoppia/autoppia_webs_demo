import type { Book } from "@/data/books";
import { SeedLink } from "@/components/ui/SeedLink";
import { BookOpen, Star, ArrowRight } from "lucide-react";

interface SpotlightRowProps {
  title: string;
  description: string;
  movies: Book[];
}

export function SpotlightRow({ title, description, movies }: SpotlightRowProps) {
  if (!movies.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between text-white">
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-sm text-white/70 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <SeedLink
            key={movie.id}
            href={`/books/${movie.id}`}
            className="group flex-shrink-0 min-w-[240px] rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2"
          >
            <div className="relative overflow-hidden mb-4">
              <div
                className="aspect-[2/3] w-full rounded-2xl bg-cover bg-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${movie.poster}), url('/media/gallery/default_book.png')` }}
              />
              {/* Rating badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1.5 border border-white/20">
                <Star className="h-3 w-3 fill-secondary text-secondary" />
                <span className="text-xs font-bold text-white">{movie.rating}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-secondary font-semibold">{movie.genres[0] || "Genre"}</p>
              <h4 className="text-lg font-bold leading-tight group-hover:text-secondary transition-colors line-clamp-2">{movie.title}</h4>
              <p className="text-sm text-white/70">{movie.director}</p>
              <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-secondary/20 px-4 py-2.5 text-sm font-semibold text-secondary backdrop-blur-sm transition-all group-hover:bg-secondary group-hover:text-black group-hover:border-secondary group-hover:scale-105 shadow-lg group-hover:shadow-secondary/30">
                <span>View details</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </SeedLink>
        ))}
      </div>
    </section>
  );
}
