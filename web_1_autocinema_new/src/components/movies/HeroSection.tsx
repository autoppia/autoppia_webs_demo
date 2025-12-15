"use client";

import type { Movie } from "@/data/movies";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp, Play, Star, Search as SearchIcon } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/library/utils";
import { useDynamic } from "@/dynamic/shared";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  featuredMovies: Movie[];
  className?: string;
}

export function HeroSection({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  featuredMovies,
  className,
}: HeroSectionProps) {
  const dyn = useDynamic();
  const stats = useMemo(() => {
    const totalDuration = featuredMovies.reduce((acc, movie) => acc + movie.duration, 0);
    return {
      avgDuration: featuredMovies.length ? Math.round(totalDuration / featuredMovies.length) : 90,
      avgRating: featuredMovies.length
        ? (featuredMovies.reduce((acc, movie) => acc + movie.rating, 0) / featuredMovies.length).toFixed(1)
        : "4.0",
      genres: new Set(featuredMovies.flatMap((movie) => movie.genres)).size,
    };
  }, [featuredMovies]);

  const topMovies = featuredMovies.slice(0, 3);

  return (
    <>
      {dyn.v1.wrap("hero-section", (
        <section
          id={dyn.v3.id("hero-section")}
          className={cn(
            "relative w-full overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] text-white",
            className,
            dyn.v3.class("hero-section", "")
          )}
        >
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative w-full px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            {/* Left side - Search and info */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/20">
                  <Sparkles className="h-4 w-4 text-secondary" />
                </div>
                <span>Curated AI cinema collections</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight lg:text-6xl xl:text-7xl mb-6">
                {dyn.v3.text("hero_title", "Discover AI-driven stories, remixed genres, and cinematic experiments.")}
              </h1>
              
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                {dyn.v3.text("hero_description", "Search hundreds of procedurally generated movies loaded directly from our datasets service. No backend, no forms – just cinema.")}
              </p>

              <form
                className="mb-10 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSearchSubmit();
                }}
              >
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search directors, titles, or moods"
                    className="pl-12 h-14 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-14 px-8 bg-secondary text-black hover:bg-secondary/90 shadow-lg shadow-secondary/20 font-semibold text-base"
                >
                  {dyn.v3.text("search_button", "Search library")}
                </Button>
              </form>

              <dl className="grid grid-cols-3 gap-4">
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/30 hover:bg-white/10 hover:scale-105">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Avg duration</dt>
                  <dd className="text-4xl font-bold text-white">{stats.avgDuration}m</dd>
                </div>
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/30 hover:bg-white/10 hover:scale-105">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Avg rating</dt>
                  <dd className="text-4xl font-bold text-white">{stats.avgRating}</dd>
                </div>
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/30 hover:bg-white/10 hover:scale-105">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Genres</dt>
                  <dd className="text-4xl font-bold text-white">{stats.genres}</dd>
                </div>
              </dl>
            </div>

            {/* Right side - Featured movies showcase */}
            <div className="lg:col-span-7 xl:col-span-8">
              {dyn.v1.wrap("hero-featured-header", (
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <h2 id={dyn.v3.id("featured-title")} className="text-3xl font-bold">
                    {dyn.v3.text("featured_title", "Featured This Week")}
                  </h2>
                </div>
              ))}
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topMovies.map((movie, index) => (
                  <div
                    key={movie.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-1"
                  >
                    {/* Movie poster with overlay */}
                    <div
                      className="relative overflow-hidden bg-cover bg-center aspect-[2/3] transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${movie.poster}), url('/media/gallery/default_movie.png')`,
                      }}
                    >
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {/* Content overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="rounded-full bg-secondary/30 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-secondary border border-secondary/30">
                            {movie.genres[0] || "Cinematic"}
                          </span>
                          <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/10">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {movie.rating}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-2xl lg:text-3xl font-bold leading-tight mb-3 drop-shadow-lg">
                          {movie.title}
                        </h3>
                        
                        {/* Synopsis */}
                        <p className="text-sm lg:text-base text-white/90 mb-4 line-clamp-2 leading-relaxed">
                          {movie.synopsis}
                        </p>
                        
                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-xs lg:text-sm text-white/80 mb-5 font-medium">
                          <span>{movie.year}</span>
                          <span className="text-white/40">•</span>
                          <span>{movie.duration}m</span>
                          <span className="text-white/40">•</span>
                          <span className="truncate">{movie.director}</span>
                        </div>
                        
                        {/* CTA Button */}
                        <SeedLink
                          href={`/movies/${movie.id}`}
                          id={dyn.v3.id("hero-view-details-btn")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:bg-secondary/90 hover:scale-105 shadow-lg shadow-secondary/20"
                        >
                          <Play className="h-4 w-4" />
                          {dyn.v3.text("view_details", "View Details")}
                        </SeedLink>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
      ))}
    </>
  );
}
