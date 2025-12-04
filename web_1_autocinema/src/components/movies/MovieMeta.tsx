import type { Movie } from "@/models";
import { applyDynamicWrapper, useSeedValue } from "@/components/ui/variants";

interface MovieMetaProps {
  movie: Movie;
}

export function MovieMeta({ movie }: MovieMetaProps) {
  const seed = useSeedValue();
  return applyDynamicWrapper(
    seed,
    "movie-meta",
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">About this title</h2>
          <p className="mt-3 text-white/80">{movie.synopsis}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {movie.genres.slice(0, 6).map((g) => (
              <span key={g} className="rounded-full border border-white/15 px-3 py-1 text-white/80">{g}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Details</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase text-white/50">Duration</p>
              <p className="text-white">{movie.duration} min</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase text-white/50">Year</p>
              <p className="text-white">{movie.year}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase text-white/50">Rating</p>
              <p className="text-white">⭐ {movie.rating}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase text-white/50">Director</p>
              <p className="text-white">{movie.director}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase text-white/50">Top cast</p>
              <p className="text-white">{movie.cast.slice(0, 5).join(", ") || "Classified"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>,
    movie.id
  );
}
