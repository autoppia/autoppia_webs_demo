"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";
import { HeroSection } from "@/components/movies/HeroSection";
import { SpotlightRow } from "@/components/movies/SpotlightRow";
import { getFeaturedMovies, getMoviesByGenre, getAvailableGenres, getMovies } from "@/dynamic/v2-data";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Search, Film, Star, TrendingUp, Sparkles, ArrowRight, Play, Clock, Calendar } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/library/utils";
import { useDynamic } from "@/dynamic/shared";

function HomeContent() {
  const router = useSeedRouter();
  const dyn = useDynamic();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug: Verificar que V1 y V3 están funcionando
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[page.tsx] Debug dinámico:", {
        seed: dyn.seed,
        v1Enabled: isV1Enabled(),
        v3Enabled: isV3Enabled(),
      });
    }
  }, [dyn.seed]);

  const featuredMovies = useMemo(() => getFeaturedMovies(6), []);
  const allMovies = useMemo(() => getMovies(), []);
  const genres = useMemo(() => getAvailableGenres(), []);

  const handleSearchSubmit = () => {
    // Redirect to search page with query
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  };

  // Get movies by different genres for spotlight sections
  const dramaFocus = useMemo(() => getMoviesByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getMoviesByGenre("Thriller").slice(0, 5), []);
  const actionFocus = useMemo(() => getMoviesByGenre("Action").slice(0, 5), []);
  const comedyFocus = useMemo(() => getMoviesByGenre("Comedy").slice(0, 5), []);

  // Get popular genres (top 6 by movie count)
  const popularGenres = useMemo(() => {
    const genreCounts = genres.map((genre) => ({
      genre,
      count: getMoviesByGenre(genre).length,
    }));
    return genreCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((g) => g.genre);
  }, [genres]);

  // Calculate stats
  const stats = useMemo(() => {
    if (allMovies.length === 0) {
      return {
        totalMovies: 0,
        totalGenres: 0,
        avgRating: "0.0",
        avgDuration: 0,
      };
    }
    const totalDuration = allMovies.reduce((acc, movie) => acc + movie.duration, 0);
    const totalRating = allMovies.reduce((acc, movie) => acc + movie.rating, 0);
    return {
      totalMovies: allMovies.length,
      totalGenres: genres.length,
      avgRating: (totalRating / allMovies.length).toFixed(1),
      avgDuration: Math.round(totalDuration / allMovies.length),
    };
  }, [allMovies, genres]);

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Smart Search",
      description: "Find movies instantly by title, director, or any keyword",
    },
    {
      icon: <Film className="h-6 w-6" />,
      title: "Vast Collection",
      description: "Explore thousands of movies across all genres",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Curated Picks",
      description: "Hand-selected featured movies updated weekly",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Trending Now",
      description: "Discover what's popular and trending",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0d14] via-[#141926] to-[#0F172A] relative">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      {/* Main Content */}
      <main className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="space-y-20">
          {/* Enhanced Stats & Featured Section */}
          {dyn.v1.wrap("home-main-section", (
            <div className="relative">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-secondary/10 rounded-3xl blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0 rounded-3xl" />
              
              <div
                id={dyn.v3.id("home-main-container")}
                className={cn(
                  "relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm overflow-hidden",
                  dyn.v3.class("main-container", "")
                )}
              >
              {/* Header Section */}
              {dyn.v1.wrap("home-header", (
                <div className="text-center mb-10">
                  <h2 id={dyn.v3.id("home-title")} className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                    {dyn.v3.text("app_title", "Autocinema")}
                  </h2>
                  <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                    {dyn.v3.text("app_description", "Your intelligent movie search engine. Discover thousands of films, explore by genre, and find your next cinematic adventure.")}
                  </p>
                </div>
              ))}

              {/* Search Bar */}
              {dyn.v1.wrap("home-search-section", (
                <div className="mb-10">
                  <form
                    id={dyn.v3.id("search-form")}
                    className={cn(
                      "flex flex-col gap-3 sm:flex-row max-w-3xl mx-auto",
                      dyn.v3.class("search-form", "")
                    )}
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSearchSubmit();
                    }}
                  >
                    {dyn.v1.wrap("search-input-container", (
                      <div className="relative flex-1">
                        <Search
                          id={dyn.v3.id("search-icon")}
                          className={cn(
                            "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40",
                            dyn.v3.class("icon-search", "")
                          )}
                        />
                        <Input
                          type="search"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Search directors, titles, or moods"
                          className="pl-12 h-14 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
                        />
                      </div>
                    ))}
                    <Button
                      id={dyn.v3.id("search-submit-button")}
                      type="submit"
                      className={cn(
                        "h-14 px-8 bg-secondary text-black hover:bg-secondary/90 shadow-lg shadow-secondary/20 font-semibold text-base",
                        dyn.v3.class("search-button", "")
                      )}
                    >
                      {dyn.v3.text("search_button", "Search")}
                    </Button>
                  </form>
                </div>
              ))}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {/* Stats Card 1: Movies */}
                {dyn.v1.wrap("stats-movies-card", (
                  <div
                    id={dyn.v3.id("stats-movies-card")}
                    data-dyn-key="stats-movies-card"
                    className={cn(
                      "group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105",
                      dyn.v3.class("stats-card", "")
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20 mb-3 group-hover:bg-secondary/30 transition-colors",
                      dyn.v3.class("stats-icon-container", "")
                    )}>
                      <Film className={cn("h-5 w-5 text-secondary", dyn.v3.class("icon-film", ""))} />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {isMounted ? `${stats.totalMovies}+` : "0+"}
                    </div>
                    <div className="text-xs text-white/60 font-medium uppercase tracking-wider">
                      {dyn.v3.text("stats_movies_label", "Movies")}
                    </div>
                  </div>
                ))}
                
                {/* Stats Card 2: Genres */}
                {dyn.v1.wrap("stats-genres-card", (
                  <div
                    id={dyn.v3.id("stats-genres-card")}
                    className={cn(
                      "group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105",
                      dyn.v3.class("stats-card", "")
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 mb-3 group-hover:bg-purple-500/30 transition-colors",
                      dyn.v3.class("stats-icon-container", "")
                    )}>
                      <Sparkles className={cn("h-5 w-5 text-purple-400", dyn.v3.class("icon-sparkles", ""))} />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {isMounted ? stats.totalGenres : "0"}
                    </div>
                    <div className="text-xs text-white/60 font-medium uppercase tracking-wider">
                      {dyn.v3.text("stats_genres_label", "Genres")}
                    </div>
                  </div>
                ))}
                
                {/* Stats Card 3: Avg Rating */}
                {dyn.v1.wrap("stats-rating-card", (
                  <div
                    id={dyn.v3.id("stats-rating-card")}
                    className={cn(
                      "group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105",
                      dyn.v3.class("stats-card", "")
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/20 mb-3 group-hover:bg-yellow-500/30 transition-colors",
                      dyn.v3.class("stats-icon-container", "")
                    )}>
                      <Star className={cn("h-5 w-5 text-yellow-400", dyn.v3.class("icon-star", ""))} />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {isMounted ? stats.avgRating : "0.0"}
                    </div>
                    <div className="text-xs text-white/60 font-medium uppercase tracking-wider">
                      {dyn.v3.text("stats_rating_label", "Avg Rating")}
                    </div>
                  </div>
                ))}
                
                {/* Stats Card 4: Avg Duration */}
                {dyn.v1.wrap("stats-duration-card", (
                  <div
                    id={dyn.v3.id("stats-duration-card")}
                    className={cn(
                      "group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105",
                      dyn.v3.class("stats-card", "")
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 mb-3 group-hover:bg-blue-500/30 transition-colors",
                      dyn.v3.class("stats-icon-container", "")
                    )}>
                      <Clock className={cn("h-5 w-5 text-blue-400", dyn.v3.class("icon-clock", ""))} />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {isMounted ? `${stats.avgDuration}m` : "0m"}
                    </div>
                    <div className="text-xs text-white/60 font-medium uppercase tracking-wider">
                      {dyn.v3.text("stats_duration_label", "Avg Duration")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Featured Movies */}
              <div>
                {dyn.v1.wrap("home-featured-header", (
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      id={dyn.v3.id("featured-header-icon-container")}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20",
                        dyn.v3.class("header-icon-container", "")
                      )}
                    >
                      <TrendingUp
                        id={dyn.v3.id("featured-header-icon")}
                        className={cn(
                          "h-5 w-5 text-secondary",
                          dyn.v3.class("icon-trending-up", "")
                        )}
                      />
                    </div>
                    <h2 id={dyn.v3.id("featured-section-title")} className="text-3xl font-bold text-white">
                      {dyn.v3.text("featured_title", "Featured This Week")}
                    </h2>
                  </div>
                ))}
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredMovies.slice(0, 3).map((movie, index) => (
                    dyn.v1.wrap(`featured-movie-${index}`, (
                      <div
                        key={movie.id}
                        id={dyn.v3.id("featured-movie-card", index)}
                        className={cn(
                          "group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-1",
                          dyn.v3.class("featured-movie-card", "")
                        )}
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
                            {dyn.v1.wrap(`featured-movie-badges-${index}`, (
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {dyn.v1.wrap(`featured-movie-genre-badge-${index}`, (
                                  <span
                                    id={dyn.v3.id("featured-movie-genre", index)}
                                    className={cn(
                                      "rounded-full bg-secondary/30 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-secondary border border-secondary/30",
                                      dyn.v3.class("genre-badge", "")
                                    )}
                                  >
                                    {movie.genres[0] || "Cinematic"}
                                  </span>
                                ))}
                                {dyn.v1.wrap(`featured-movie-rating-badge-${index}`, (
                                  <div
                                    id={dyn.v3.id("featured-movie-rating", index)}
                                    className={cn(
                                      "flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/10",
                                      dyn.v3.class("rating-badge", "")
                                    )}
                                  >
                                    <Star className={cn("h-3.5 w-3.5 fill-yellow-400 text-yellow-400", dyn.v3.class("icon-star-small", ""))} />
                                    {movie.rating}
                                  </div>
                                ))}
                              </div>
                            ))}
                            
                            {/* Title */}
                            <h3
                              id={dyn.v3.id("featured-movie-title", index)}
                              className={cn(
                                "text-2xl lg:text-3xl font-bold leading-tight mb-3 drop-shadow-lg",
                                dyn.v3.class("movie-title", "")
                              )}
                            >
                              {movie.title}
                            </h3>
                            
                            {/* Synopsis */}
                            <p
                              id={dyn.v3.id("featured-movie-synopsis", index)}
                              className={cn(
                                "text-sm lg:text-base text-white/90 mb-4 line-clamp-2 leading-relaxed",
                                dyn.v3.class("movie-synopsis", "")
                              )}
                            >
                              {movie.synopsis}
                            </p>
                            
                            {/* Meta info */}
                            <div
                              id={dyn.v3.id("featured-movie-meta", index)}
                              className={cn(
                                "flex items-center gap-3 text-xs lg:text-sm text-white/80 mb-5 font-medium",
                                dyn.v3.class("movie-meta", "")
                              )}
                            >
                              <span>{movie.year}</span>
                              <span className="text-white/40">•</span>
                              <span>{movie.duration}m</span>
                              <span className="text-white/40">•</span>
                              <span className="truncate">{movie.director}</span>
                            </div>
                            
                            {/* CTA Button */}
                            <SeedLink
                              href={`/movies/${movie.id}`}
                              id={dyn.v3.id("featured-movie-view-details-btn", index)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:bg-secondary/90 hover:scale-105 shadow-lg shadow-secondary/20"
                            >
                              <Play className="h-4 w-4" />
                              {dyn.v3.text("view_details", "View Details")}
                            </SeedLink>
                          </div>
                        </div>
                      </div>
                    ), undefined, movie.id)
                  ))}
                </div>
              </div>
            </div>
            </div>
          ))}

          {/* Popular Genres */}
          {dyn.v1.wrap("home-genres-section", (
            <div>
              {dyn.v1.wrap("home-genres-header", (
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 id={dyn.v3.id("genres-title")} className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {dyn.v3.text("browse_genres", "Browse by Genre")}
                    </h2>
                    <p className="text-white/70">
                      {dyn.v3.text("genres_description", "Explore movies by your favorite genre")}
                    </p>
                  </div>
                  <SeedLink
                    href="/search"
                    className="hidden md:flex items-center gap-2 text-secondary hover:text-secondary/80 font-semibold transition-colors"
                  >
                    {dyn.v3.text("view_all", "View All")}
                    <ArrowRight className="h-4 w-4" />
                  </SeedLink>
                </div>
              ))}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularGenres.map((genre, index) => {
                  const genreMovies = getMoviesByGenre(genre);
                  return (
                    dyn.v1.wrap(`genre-card-${index}`, (
                      <SeedLink
                        key={genre}
                        href={`/search?genre=${encodeURIComponent(genre)}`}
                        id={dyn.v3.id("genre-card", index)}
                        className={cn(
                          "group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105 text-center",
                          dyn.v3.class("genre-card", "")
                        )}
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 mb-3 mx-auto group-hover:bg-secondary/30 transition-colors">
                          <Film className="h-6 w-6 text-secondary" />
                        </div>
                        <h3 className="font-bold text-white mb-1">{genre}</h3>
                        <p className="text-xs text-white/60">
                          {genreMovies.length} {dyn.v3.text("movies_label", "movies")}
                        </p>
                      </SeedLink>
                    ), undefined, genre)
                  );
                })}
              </div>
            </div>
          ))}

          {/* Features Section */}
          {dyn.v1.wrap("home-features-section", (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 rounded-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm">
                {dyn.v1.wrap("home-features-header", (
                  <div className="text-center mb-12">
                    <h2 id={dyn.v3.id("features-title")} className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {dyn.v3.text("why_choose", "Why Choose")}
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-400">
                        {dyn.v3.text("app_title", "Autocinema")}?
                      </span>
                    </h2>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                      {dyn.v3.text("features_description", "The ultimate movie discovery platform designed for cinephiles")}
                    </p>
                  </div>
                ))}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {features.map((feature, index) => (
                    dyn.v1.wrap(`feature-card-${index}`, (
                      <div
                        key={index}
                        id={dyn.v3.id("feature-card", index)}
                        className={cn(
                          "group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:-translate-y-1",
                          dyn.v3.class("feature-card", "")
                        )}
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 mb-4 group-hover:bg-secondary/30 transition-colors">
                          <div className="text-secondary">{feature.icon}</div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-white/70">{feature.description}</p>
                      </div>
                    ), undefined, `feature-${index}`)
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Spotlight sections */}
          <div className="space-y-12">
            <SpotlightRow
              title="Drama focus"
              description="Slow burns, futuristic romances, and everything in between"
              movies={dramaFocus}
            />
            <SpotlightRow
              title="Thriller laboratory"
              description="High-tension ideas sourced from the dataset variant you picked"
              movies={thrillerFocus}
            />
            {actionFocus.length > 0 && (
              <SpotlightRow
                title="Action packed"
                description="High-octane adventures and explosive entertainment"
                movies={actionFocus}
              />
            )}
            {comedyFocus.length > 0 && (
              <SpotlightRow
                title="Comedy gold"
                description="Laughs, chuckles, and feel-good moments"
                movies={comedyFocus}
              />
            )}
          </div>

          {/* CTA Section */}
          {dyn.v1.wrap("home-cta-section", (
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent p-12 text-center backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.2),transparent_70%)]" />
              <div className="relative">
                <TrendingUp className="h-16 w-16 text-secondary mx-auto mb-6" />
                <h2 id={dyn.v3.id("cta-title")} className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {dyn.v3.text("cta_title", "Ready to explore?")}
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  {dyn.v3.text("cta_description", "Start searching for movies now and discover your next favorite story")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SeedLink href="/search">
                    <Button className="h-14 px-8 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105">
                      <Search className="h-5 w-5 mr-2" />
                      {dyn.v3.text("go_to_search", "Go to Search")}
                    </Button>
                  </SeedLink>
                  <SeedLink href="/about">
                    <Button
                      variant="outline"
                      className="h-14 px-8 border-white/20 bg-white/10 text-white hover:bg-white/20 font-semibold text-base backdrop-blur-sm"
                    >
                      {dyn.v3.text("learn_more", "Learn More")}
                    </Button>
                  </SeedLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading…</div>}>
      <HomeContent />
    </Suspense>
  );
}
