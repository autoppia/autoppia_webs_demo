import type { Movie } from "@/models";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { SeedLink } from "@/components/ui/SeedLink";

interface MovieRowCarouselProps {
  title: string;
  description?: string;
  movies: Movie[];
}

export function MovieRowCarousel({ title, description, movies }: MovieRowCarouselProps) {
  if (!movies.length) return null;

  return (
    <section className="relative space-y-2">
      <div className="flex items-baseline justify-between text-white">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          {description ? <p className="text-sm text-white/70">{description}</p> : null}
        </div>
      </div>
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 sm:-ml-4">
            {movies.map((movie) => (
              <CarouselItem key={movie.id} className="pl-2 sm:pl-4 basis-1/2 sm:basis-1/4 lg:basis-1/6">
                <SeedLink href={`/movies/${movie.id}`} className="group block h-full">
                  <div className="relative overflow-hidden rounded-md">
                    <div
                      className="aspect-[2/3] w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(5,7,13,0.0), rgba(5,7,13,0.65)), url(${movie.poster}), url('/media/gallery/default_movie.png')` }}
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/0 to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="w-full">
                        <h4 className="line-clamp-2 text-xs font-semibold leading-tight text-white md:text-sm">
                          {movie.title}
                        </h4>
                        <p className="mt-0.5 hidden text-[10px] text-white/70 sm:block">
                          {movie.year} · ⭐ {movie.rating}
                        </p>
                      </div>
                    </div>
                  </div>
                </SeedLink>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-6 bg-white/10 text-white hover:bg-white/20" />
          <CarouselNext className="-right-6 bg-white/10 text-white hover:bg-white/20" />
        </Carousel>
      </div>
    </section>
  );
}


