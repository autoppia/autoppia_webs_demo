import type { Movie } from "@/data/movies";

interface MovieMetaProps {
  movie: Movie;
}

export function MovieMeta({ movie }: MovieMetaProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">Synopsis</h2>
          <p className="mt-3 text-white/70">{movie.synopsis}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Film details</h3>
          <dl className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <dt>Duration</dt>
              <dd>{movie.duration} min</dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <dt>Genres</dt>
              <dd>{movie.genres.slice(0, 3).join(", ")}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <dt>Director</dt>
              <dd>{movie.director}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Cast</dt>
              <dd>{movie.cast.slice(0, 4).join(", ") || "Classified"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
