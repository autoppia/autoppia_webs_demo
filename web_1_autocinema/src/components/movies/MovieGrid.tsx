import type { Movie } from "@/models";
import { MovieCard } from "./MovieCard";

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie?: (movie: Movie) => void;
  layoutClass?: string;
}

export function MovieGrid({ movies, onSelectMovie, layoutClass }: MovieGridProps) {
  if (!movies.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center text-white/70">
        No movies found. Try a different genre or year.
      </div>
    );
  }

  // Always use 3 columns on large screens, ignore layout variants
  // Force grid layout regardless of layoutClass prop
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
      ))}
    </div>
  );
}
