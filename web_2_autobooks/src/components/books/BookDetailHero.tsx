import type { Book } from "@/data/books";
import { Button } from "@/components/ui/button";
import { BookOpen, Bookmark, Share2, ShoppingCart } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

interface BookDetailHeroProps {
  book: Book;
  onReadBook: () => void;
  onReadingList: () => void;
  onShare: () => void;
  onAddToCart?: () => void;
  isInReadingList?: boolean;
}

export function BookDetailHero({
  book,
  onReadBook,
  onReadingList,
  onShare,
  onAddToCart,
  isInReadingList = false,
}: BookDetailHeroProps) {
  const dyn = useDynamicSystem();

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm shadow-2xl lg:flex lg:items-start lg:gap-8">
      <div className="relative group">
        <div
          className="mx-auto aspect-[2/3] w-64 rounded-3xl border border-white/20 bg-cover bg-center shadow-2xl transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(12,17,32,0.1), rgba(4,6,12,0.6)), url(${book.poster}), url('/media/gallery/default_book.png')` }}
        />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-6 flex-1 space-y-6 lg:mt-0">
        <div className="flex flex-wrap items-center gap-3">
          {book.genres.slice(0, 3).map((genre, idx) => (
            <span key={idx} className="rounded-full bg-secondary/20 border border-secondary/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
              {genre}
            </span>
          ))}
          <span className="text-sm text-white/60">•</span>
          <span className="text-sm font-medium text-white/80">{book.year}</span>
          <span className="text-sm text-white/60">•</span>
          <span className="text-sm font-medium text-white/80">{book.duration} pages</span>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {book.title}
          </h1>
        </div>
        <p className="text-lg text-white/80 leading-relaxed max-w-2xl">{book.synopsis}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Author</p>
            <p className="text-base font-semibold text-white">{book.director}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Rating</p>
            <p className="text-base font-semibold text-white flex items-center gap-1">
              <span className="text-secondary">⭐</span> {book.rating}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {book.trailerUrl && (
            dyn.v1.addWrapDecoy("read-book-button", (
              <Button
                id={dyn.v3.getVariant("read-book-button", ID_VARIANTS_MAP, "read-book-button")}
                className={cn("h-12 px-6 bg-secondary text-black hover:bg-secondary/90 font-bold shadow-lg shadow-secondary/20 transition-all hover:scale-105", dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, ""))}
                onClick={onReadBook}
              >
                <BookOpen className="h-5 w-5 mr-2" /> {dyn.v3.getVariant("read_book", TEXT_VARIANTS_MAP, "Read book")}
              </Button>
            ))
          )}
          {onAddToCart && (
            dyn.v1.addWrapDecoy("add-to-cart-detail-button", (
              <Button
                variant="ghost"
                id={dyn.v3.getVariant("add-to-cart-detail-button", ID_VARIANTS_MAP, "add-to-cart-detail-button")}
                className={cn("h-12 px-6 border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all hover:scale-105", dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                onClick={onAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" /> {dyn.v3.getVariant("add_to_cart", TEXT_VARIANTS_MAP, "Add to cart")}
              </Button>
            ))
          )}
          {dyn.v1.addWrapDecoy("reading-list-button", (
            <Button
              variant="ghost"
              id={dyn.v3.getVariant("reading-list-button", ID_VARIANTS_MAP, "reading-list-button")}
              className={cn("h-12 px-6 border transition-all hover:scale-105", dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""), isInReadingList
                ? "border-secondary/30 bg-secondary/20 text-secondary hover:bg-secondary/30"
                : "border-white/20 bg-white/5 text-white hover:bg-white/10")}
              onClick={onReadingList}
            >
              <Bookmark className={`h-5 w-5 mr-2 ${isInReadingList ? "fill-secondary" : ""}`} />
              {dyn.v3.getVariant(isInReadingList ? "remove_from_reading_list" : "add_to_reading_list", TEXT_VARIANTS_MAP, isInReadingList ? "Remove from reading list" : "Add to reading list")}
            </Button>
          ))}
          {dyn.v1.addWrapDecoy("share-detail-button", (
            <Button
              variant="ghost"
              id={dyn.v3.getVariant("share-detail-button", ID_VARIANTS_MAP, "share-detail-button")}
              className={cn("h-12 px-6 border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all hover:scale-105", dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
              onClick={onShare}
            >
              <Share2 className="h-5 w-5 mr-2" /> {dyn.v3.getVariant("share", TEXT_VARIANTS_MAP, "Share")}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
