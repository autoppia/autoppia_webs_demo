import type { Movie } from "@/data/movies";
import { SeedLink } from "@/components/ui/SeedLink";
import { Film, ArrowRight } from "lucide-react";

interface RelatedMoviesProps {
  movies: Movie[];
  title?: string;
}

export function RelatedMovies({ movies, title = "Related films" }: RelatedMoviesProps) {
  if (!movies.length) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl text-white">
      <div className="flex items-center gap-3 mb-6">
        <Film className="h-5 w-5 text-secondary" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {movies.map((movie) => (
          <SeedLink
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:border-secondary/50 hover:shadow-xl"
          >
            <div
              className="aspect-[2/3] w-full rounded-xl bg-cover bg-center shadow-lg transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${movie.poster}), url('/media/gallery/default_movie.png')` }}
            />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1">{movie.genres[0] || "Genre"}</p>
              <h3 className="text-base font-bold line-clamp-2 mb-2 group-hover:text-secondary transition-colors">{movie.title}</h3>
              <p className="text-xs text-white/60 mb-3">{movie.year} · {movie.duration} min</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-secondary group-hover:gap-2 transition-all">
                View detail <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </SeedLink>
        ))}
      </div>
    </section>
  );
}
