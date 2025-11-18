import type { Book } from "@/data/books";
import { Button } from "@/components/ui/button";
import { Play, Bookmark, Share2 } from "lucide-react";

interface MovieDetailHeroProps {
  movie: Book;
  onWatchTrailer: () => void;
  onWatchlist: () => void;
  onShare: () => void;
}

export function MovieDetailHero({ movie, onWatchTrailer, onWatchlist, onShare }: MovieDetailHeroProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1120] via-[#05070d] to-[#04060c] p-6 text-white shadow-2xl lg:flex lg:items-center lg:gap-8">
      <div
        className="mx-auto aspect-[2/3] w-64 rounded-3xl border border-white/10 bg-cover bg-center shadow-2xl"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(12,17,32,0.2), rgba(4,6,12,0.8)), url(${movie.poster})` }}
      />
      <div className="mt-6 flex-1 space-y-4 lg:mt-0">
        <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-widest text-white/60">
          <span>{movie.genres.slice(0, 3).join(" · ")}</span>
          <span>Year {movie.year}</span>
          <span>{movie.duration} pages</span>
        </div>
        <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">{movie.title}</h1>
        <p className="text-white/70">{movie.synopsis}</p>
        <div className="flex flex-wrap gap-4 text-sm text-white/60">
          <div>
            <p className="text-xs uppercase text-white/40">Author</p>
            <p className="text-base text-white">{movie.director}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-white/40">Contributors</p>
            <p className="text-base text-white">{movie.cast.slice(0, 3).join(", ") || "Unlisted"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-white/40">Rating</p>
            <p className="text-base text-white">⭐ {movie.rating}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {movie.trailerUrl && (
            <Button className="bg-secondary text-black hover:bg-secondary/80" onClick={onWatchTrailer}>
              <Play className="h-4 w-4" /> Preview sample
            </Button>
          )}
          <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={onWatchlist}>
            <Bookmark className="h-4 w-4" /> Add to reading list
          </Button>
          <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={onShare}>
            <Share2 className="h-4 w-4" /> Share book
          </Button>
        </div>
      </div>
    </section>
  );
}
