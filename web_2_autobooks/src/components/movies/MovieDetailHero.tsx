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
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl lg:flex lg:items-start lg:gap-8">
      <div className="relative group">
        <div
          className="mx-auto aspect-[2/3] w-64 rounded-3xl border border-white/20 bg-cover bg-center shadow-2xl transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(12,17,32,0.1), rgba(4,6,12,0.6)), url(${movie.poster}), url('/media/gallery/default_book.png')` }}
        />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-6 flex-1 space-y-6 lg:mt-0">
        <div className="flex flex-wrap items-center gap-3">
          {movie.genres.slice(0, 3).map((genre, idx) => (
            <span key={idx} className="rounded-full bg-secondary/20 border border-secondary/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
              {genre}
            </span>
          ))}
          <span className="text-sm text-white/60">•</span>
          <span className="text-sm font-medium text-white/80">{movie.year}</span>
          <span className="text-sm text-white/60">•</span>
          <span className="text-sm font-medium text-white/80">{movie.duration} pages</span>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {movie.title}
          </h1>
        </div>
        <p className="text-lg text-white/80 leading-relaxed max-w-2xl">{movie.synopsis}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Author</p>
            <p className="text-base font-semibold text-white">{movie.director}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Contributors</p>
            <p className="text-base font-semibold text-white">{movie.cast.slice(0, 3).join(", ") || "Unlisted"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Rating</p>
            <p className="text-base font-semibold text-white flex items-center gap-1">
              <span className="text-secondary">⭐</span> {movie.rating}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {movie.trailerUrl && (
            <Button 
              className="h-12 px-6 bg-secondary text-black hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 transition-all hover:scale-105" 
              onClick={onWatchTrailer}
            >
              <Play className="h-5 w-5 mr-2" /> Preview sample
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="h-12 px-6 border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all hover:scale-105" 
            onClick={onWatchlist}
          >
            <Bookmark className="h-5 w-5 mr-2" /> Add to reading list
          </Button>
          <Button 
            variant="ghost" 
            className="h-12 px-6 border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all hover:scale-105" 
            onClick={onShare}
          >
            <Share2 className="h-5 w-5 mr-2" /> Share book
          </Button>
        </div>
      </div>
    </section>
  );
}
