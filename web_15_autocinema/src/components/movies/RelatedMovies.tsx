import type { Movie } from "@/data/movies";
import { SeedLink } from "@/components/ui/SeedLink";

interface RelatedMoviesProps {
  movies: Movie[];
  title?: string;
}

export function RelatedMovies({ movies, title = "Related films" }: RelatedMoviesProps) {
  if (!movies.length) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {movies.map((movie) => (
          <div key={movie.id} className="flex gap-4 rounded-2xl border border-white/10 bg-black/40 p-4">
            <div
              className="h-24 w-24 flex-shrink-0 rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${movie.poster})` }}
            />
            <div>
              <p className="text-xs uppercase text-white/50">{movie.genres[0] || "Genre"}</p>
              <h3 className="text-lg font-semibold">{movie.title}</h3>
              <p className="text-sm text-white/70">{movie.year} · {movie.duration} min</p>
              <SeedLink href={`/movies/${movie.id}`} className="mt-2 inline-flex text-xs uppercase tracking-wide text-secondary">
                View detail →
              </SeedLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
