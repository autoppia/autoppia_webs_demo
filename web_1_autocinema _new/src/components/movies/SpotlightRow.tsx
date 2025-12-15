import type { Movie } from "@/data/movies";
import { SeedLink } from "@/components/ui/SeedLink";

interface SpotlightRowProps {
  title: string;
  description: string;
  movies: Movie[];
}

export function SpotlightRow({ title, description, movies }: SpotlightRowProps) {
  if (!movies.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between text-white">
        <div>
          <h3 className="text-3xl font-bold mb-2">{title}</h3>
          <p className="text-base text-white/70">{description}</p>
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <div 
            key={movie.id} 
            className="group min-w-[280px] flex-shrink-0 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 text-white backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1"
          >
            <div
              className="aspect-video rounded-2xl bg-cover bg-center overflow-hidden shadow-xl transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${movie.poster}), url('/media/gallery/default_movie.png')` }}
            />
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                {movie.genres[0] || "Genre"}
              </p>
              <h4 className="text-xl font-bold leading-tight mb-2 group-hover:text-secondary transition-colors">
                {movie.title}
              </h4>
              <p className="text-sm text-white/80 mb-3">{movie.director}</p>
              <SeedLink
                href={`/movies/${movie.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                View Details →
              </SeedLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
