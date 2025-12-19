import type { Book } from "@/data/books";
import { SeedLink } from "@/components/ui/SeedLink";
import { Star, BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import { useDynamicSystem } from "@/dynamic/shared";
import { cn } from "@/library/utils";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface SpotlightRowProps {
  title: string;
  description: string;
  books: Book[];
}

export function SpotlightRow({ title, description, books }: SpotlightRowProps) {
  const dyn = useDynamicSystem();
  if (!books.length) return null;

  return (
    <>
      {dyn.v1.addWrapDecoy("spotlight-row", (
        <section 
          id={dyn.v3.getVariant("spotlight-row", ID_VARIANTS_MAP, "spotlight-row")}
          className={cn("space-y-6", dyn.v3.getVariant("spotlight-row", CLASS_VARIANTS_MAP, ""))}
        >
          {dyn.v1.addWrapDecoy("spotlight-header", (
            <div className="flex items-baseline justify-between text-white">
              <div>
                <h3 id={dyn.v3.getVariant("spotlight-title", ID_VARIANTS_MAP, "spotlight-title")} className="text-3xl md:text-4xl font-bold mb-2">
                  {title}
                </h3>
                <p className="text-base text-white/70">{description}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-6 overflow-x-auto overflow-y-visible pb-4 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {books.map((book, index) => (
              dyn.v1.addWrapDecoy(`spotlight-book-${index}`, (
                <div 
                  key={book.id}
                  id={dyn.v3.getVariant(index > 0 ? `spotlight-book-card-${index}` : "spotlight-book-card", ID_VARIANTS_MAP, index > 0 ? `spotlight-book-card-${index}` : "spotlight-book-card")}
                  className={cn(
                    "group min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-white backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2",
                    dyn.v3.getVariant("book-card", CLASS_VARIANTS_MAP, "")
                  )}
                >
                  {/* Book Cover */}
                  <div className="relative mb-4 flex-shrink-0">
                    <div
                      className="aspect-[2/3] w-full rounded-2xl bg-cover bg-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      style={{ 
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${book.poster || '/media/gallery/default_book.png'}), url('/media/gallery/default_book.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Badges overlay */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <span className="rounded-full bg-secondary/30 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-secondary border border-secondary/30 whitespace-nowrap">
                          {book.genres[0] || "Fiction"}
                        </span>
                        <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/10 whitespace-nowrap">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <span>{book.rating}</span>
                        </div>
                      </div>

                      {/* Book icon overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="rounded-full bg-secondary/90 backdrop-blur-sm p-4 shadow-2xl">
                          <BookOpen className="h-8 w-8 text-black fill-black" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex flex-col flex-1 space-y-3 min-h-0">
                    <div className="flex-1 min-h-0">
                      <h4 className="text-xl font-bold leading-tight mb-2 group-hover:text-secondary transition-colors line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-sm text-white/70 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {book.synopsis || "No description available."}
                      </p>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{book.year}</span>
                      </div>
                      <span className="text-white/30">•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{book.duration} pages</span>
                      </div>
                      <span className="text-white/30">•</span>
                      <span className="truncate max-w-[100px]" title={book.director}>
                        {book.director}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <SeedLink
                      href={`/books/${book.id}`}
                      id={dyn.v3.getVariant(index > 0 ? `spotlight-view-details-btn-${index}` : "spotlight-view-details-btn", ID_VARIANTS_MAP, index > 0 ? `spotlight-view-details-btn-${index}` : "spotlight-view-details-btn")}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-secondary hover:text-black hover:border-secondary hover:scale-105 group/btn flex-shrink-0 mt-auto",
                        dyn.v3.getVariant("button", CLASS_VARIANTS_MAP, "")
                      )}
                    >
                      <span>{dyn.v3.getVariant("view_details", TEXT_VARIANTS_MAP, "Info")}</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
                    </SeedLink>
                  </div>
                </div>
              ), book.id)
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

