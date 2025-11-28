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
    <section className="space-y-2">
      <div className="flex items-baseline justify-between text-white">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {movies.map((movie) => (
          <div key={movie.id} className="min-w-[220px] rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
            <div
              className="aspect-video rounded-xl bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(5,7,13,0.2), rgba(5,7,13,0.7)), url(${movie.poster}), url('/media/gallery/default_movie.png')` }}
            />
            <p className="mt-3 text-sm uppercase text-white/50">{movie.genres[0] || "Genre"}</p>
            <h4 className="text-lg font-semibold leading-tight">{movie.title}</h4>
            <p className="text-sm text-white/70">{movie.director}</p>
            <SeedLink
              href={`/movies/${movie.id}`}
              className="mt-3 inline-flex text-xs uppercase tracking-wide text-secondary"
            >
              Details →
            </SeedLink>
          </div>
        ))}
      </div>
    </section>
  );
}
