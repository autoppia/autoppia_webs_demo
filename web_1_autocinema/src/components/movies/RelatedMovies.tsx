import type { Movie } from "@/models";
import { SeedLink } from "@/components/ui/SeedLink";
import { applyDynamicWrapper, useSeedValue } from "@/components/ui/variants";

interface RelatedMoviesProps {
  movies: Movie[];
  title?: string;
}

export function RelatedMovies({ movies, title = "Related films" }: RelatedMoviesProps) {
  if (!movies.length) return null;
  const seed = useSeedValue();

  return (
    applyDynamicWrapper(seed, "related-movies",
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="text-xs text-white/60">Because you watched similar titles</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {movies.map((movie) => (
            <SeedLink
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40"
            >
              <div
                className="aspect-[16/9] w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.65)), url(${movie.poster}), url('/media/gallery/default_movie.png')` }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <p className="text-[10px] uppercase tracking-wider text-white/60">{movie.genres[0] || "Genre"}</p>
                <h3 className="line-clamp-2 text-sm font-semibold">{movie.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                  <span>{movie.year}</span>
                  <span className="opacity-40">•</span>
                  <span>{movie.duration}m</span>
                  <span className="opacity-40">•</span>
                  <span>⭐ {movie.rating}</span>
                </div>
              </div>
            </SeedLink>
          ))}
        </div>
      </section>
    )
  );
}
