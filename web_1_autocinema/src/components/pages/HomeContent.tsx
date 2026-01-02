"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
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
import { useDynamicSystem } from "@/dynamic/shared";
import { useSeed } from "@/context/SeedContext";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";

export function HomeContent() {
  const router = useSeedRouter();
  const dyn = useDynamicSystem();
  const { isSeedReady, seed } = useSeed();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Local text variants specific to HomeContent (used only here)
  const dynamicV3TextVariants: Record<string, string[]> = {
    // Features section
    feature_1_title: ["Smart Search", "Búsqueda Inteligente", "Intelligent Search", "Advanced Search", "Quick Search", "Powerful Search", "Instant Search", "Smart Finder", "Fast Search", "Efficient Search"],
    feature_1_description: ["Find movies instantly by title, director, or any keyword", "Encuentra películas al instante por título, director o cualquier palabra clave", "Locate films quickly by name, director, or keyword", "Discover films immediately by title, director, or keyword", "Locate films instantly by name, director, or search term", "Find movies quickly by title, director, or any keyword", "Discover films immediately by title, director, or keyword", "Locate movies instantly by name, director, or search term", "Find films quickly by title, director, or keyword", "Discover movies instantly by title, director, or keyword"],
    feature_2_title: ["Vast Collection", "Colección Amplia", "Extensive Library", "Huge Catalog", "Massive Database", "Complete Library", "Full Catalog", "Vast Archive", "Huge Collection", "Comprehensive Library"],
    feature_2_description: ["Explore thousands of movies across all genres", "Explora miles de películas de todos los géneros", "Browse thousands of films from every genre", "Access thousands of movies spanning all categories", "Browse extensive collections covering every genre", "Access thousands of films from all genres", "Explore thousands of movies across all categories", "Browse thousands of films spanning all genres", "Access thousands of movies from every genre", "Browse thousands of films covering all genres"],
    feature_3_title: ["Curated Picks", "Selección Curada", "Expert Selection", "Handpicked Content", "Editor's Choice", "Weekly Picks", "Featured Selection", "Curated Content", "Best Picks", "Top Selection"],
    feature_3_description: ["Hand-selected featured movies updated weekly", "Películas destacadas seleccionadas a mano actualizadas semanalmente", "Carefully chosen featured films refreshed weekly", "Expertly curated featured films updated each week", "Carefully selected featured films refreshed weekly", "Expertly curated featured movies updated weekly", "Handpicked featured films updated every week", "Expertly selected featured films refreshed weekly", "Carefully chosen featured films updated weekly", "Hand-selected featured movies updated weekly"],
    feature_4_title: ["Trending Now", "Tendencias", "Popular Now", "What's Hot", "Hot Picks", "Trending Content", "Popular Now", "What's Trending", "Trending Now", "Hot Trends"],
    feature_4_description: ["Discover what's popular and trending", "Descubre lo que es popular y está de moda", "See what's trending and gaining popularity", "Explore trending and popular content", "Find what's currently trending and popular", "See what's popular and gaining attention", "Discover trending and popular content", "Explore popular and trending selections", "See what's popular and trending right now", "Explore what's popular and gaining momentum"],
    // Header section
    app_description: ["Your intelligent movie search engine. Discover thousands of films, explore by genre, and find your next cinematic adventure.", "Tu motor de búsqueda inteligente de películas. Descubre miles de films, explora por género y encuentra tu próxima aventura cinematográfica.", "Your smart cinema search. Browse thousands of films, filter by genre, and discover your next movie experience.", "Intelligent film discovery. Explore thousands of movies, search by genre, and find your perfect cinematic match.", "Smart movie search engine. Browse extensive film collections, filter by genre, and discover your ideal movie.", "Advanced film search. Navigate thousands of movies, explore genres, and find your perfect watch.", "Your cinema search companion. Explore vast movie libraries, filter by genre, and discover great films.", "Intelligent film finder. Search through thousands of movies, explore genres, and find your next watch.", "Smart cinema search. Browse extensive film collections, filter by genre, and discover perfect movies.", "Your film discovery engine. Explore thousands of movies, search by genre, and find amazing cinema."],
    // Features section header
    why_choose: ["Why Choose", "Por Qué Elegir", "Why Choose", "Why Us", "Why Choose Us", "Why Autocinema", "Why Choose", "Why Us", "Why Choose", "Why Choose"],
    features_description: ["The ultimate movie discovery platform designed for cinephiles", "La plataforma definitiva de descubrimiento de películas diseñada para cinéfilos", "The premier movie discovery platform for film enthusiasts", "The complete movie discovery experience for cinema lovers", "The ultimate platform for movie discovery and exploration", "The best movie discovery platform for film fans", "The premier destination for movie discovery", "The complete movie discovery experience", "The ultimate movie discovery platform", "The best platform for movie discovery"],
    // CTA section
    cta_title: ["Ready to explore?", "¿Listo para explorar?", "Ready to start?", "Start exploring?", "Ready?", "Explore now?", "Ready?", "Start exploring?", "Ready?", "Explore?"],
    cta_description: ["Start searching for movies now and discover your next favorite story", "Comienza a buscar películas ahora y descubre tu próxima historia favorita", "Begin your movie search journey and find your next favorite film", "Search our collection and discover your next cinematic favorite", "Start your movie search and find amazing films", "Search our library and find your next favorite movie", "Start searching and find amazing movies", "Search our collection and find great films", "Start your movie search journey", "Search and discover great movies"],
    go_to_search: ["Go to Search", "Ir a Búsqueda", "Start Searching", "Explore Now", "Search Now", "Browse", "Search", "Explore", "Go", "Search"],
    learn_more: ["Learn More", "Saber Más", "Learn More", "More Info", "Details", "Info", "More", "Learn", "More", "Learn"],
  };

  // Avoid hydration issues - wait until the seed is synchronized
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Do not render dynamic content until the seed is ready
  const isReady = isMounted && isSeedReady;

  // Debug: Verify V1 and V3 are working
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

  // Dynamic order for genres (only order, no V1 wrappers/decoys)
  const orderedGenres = useMemo(() => {
    if (popularGenres.length === 0) return [];
    const order = dyn.v1.changeOrderElements("genres", popularGenres.length);
    return order.map((idx) => popularGenres[idx]);
  }, [popularGenres, dyn.seed]);

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
      key: "feature_1",
    },
    {
      icon: <Film className="h-6 w-6" />,
      key: "feature_2",
    },
    {
      icon: <Star className="h-6 w-6" />,
      key: "feature_3",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      key: "feature_4",
    },
  ];

  // Dynamic order for features
  const orderedFeatures = useMemo(() => {
    if (features.length === 0) return [];
    const order = dyn.v1.changeOrderElements("features", features.length);
    return order.map((idx) => features[idx]);
  }, [dyn.seed, features]);

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
          {dyn.v1.addWrapDecoy("home-main-section", (
            <div className="relative">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-secondary/10 rounded-3xl blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0 rounded-3xl" />
              
              <div
                id={dyn.v3.getVariant("home-main-container", ID_VARIANTS_MAP, "home-main-container")}
                className={cn(
                  "relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm",
                  dyn.v3.getVariant("main-container", CLASS_VARIANTS_MAP, "")
                )}
              >
              {/* Header Section */}
              {dyn.v1.addWrapDecoy("home-header", (
                <div className="text-center mb-10">
                  <h2 id={dyn.v3.getVariant("home-title", ID_VARIANTS_MAP, "home-title")} className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                        Autocinema
                  </h2>
                  <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                    {dyn.v3.getVariant("app_description", dynamicV3TextVariants)}
                  </p>
                </div>
              ))}

              {/* Search Bar */}
              {dyn.v1.addWrapDecoy("home-search-section", (
                <div className="mb-10 w-full">
                  <form
                    id={dyn.v3.getVariant("search-form", ID_VARIANTS_MAP, "search-form")}
                    className={cn(
                      "flex flex-col gap-3 sm:flex-row w-full",
                      dyn.v3.getVariant("search-form", CLASS_VARIANTS_MAP, "")
                    )}
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSearchSubmit();
                    }}
                  >
                    {dyn.v1.addWrapDecoy("search-input-container", (
                      <div className="relative flex-1 w-full">
                        <Search
                          id={dyn.v3.getVariant("search-icon", ID_VARIANTS_MAP, "search-icon")}
                          className={cn(
                            "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40",
                            dyn.v3.getVariant("icon-search", CLASS_VARIANTS_MAP, "")
                          )}
                        />
                        <Input
                          type="search"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder={dyn.v3.getVariant("search_placeholder", undefined, "Search directors, titles, or moods")}
                          className={cn("pl-12 h-14 w-full min-w-0 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base", dyn.v3.getVariant("search-input", CLASS_VARIANTS_MAP, ""))}
                        />
                      </div>
                    ))}
                    <Button
                      id={dyn.v3.getVariant("search-submit-button", ID_VARIANTS_MAP, "search-submit-button")}
                      type="submit"
                      className={cn(
                        "h-14 min-w-[120px] px-8 bg-secondary text-black hover:bg-secondary/90 shadow-lg shadow-secondary/20 font-semibold text-base whitespace-nowrap",
                        dyn.v3.getVariant("search-button", CLASS_VARIANTS_MAP, "")
                      )}
                    >
                      {dyn.v3.getVariant("search_button", undefined, "Search")}
                    </Button>
                  </form>
                </div>
              ))}

              {/* Stats Grid - Dynamic order based on seed */}
              {(() => {
                // Define the 4 stats cards
                const statsCards = [
                  {
                    key: "stats-movies-card",
                    id: "stats-movies-card",
                    icon: Film,
                    iconColor: "secondary",
                    value: isMounted ? `${stats.totalMovies}+` : "0+",
                    label: dyn.v3.getVariant("stats_movies_label", undefined, "Movies"),
                    iconBg: "bg-secondary/20",
                    iconHover: "group-hover:bg-secondary/30",
                    iconTextColor: "text-secondary",
                  },
                  {
                    key: "stats-genres-card",
                    id: "stats-genres-card",
                    icon: Sparkles,
                    iconColor: "purple",
                    value: isMounted ? stats.totalGenres : "0",
                    label: dyn.v3.getVariant("stats_genres_label", undefined, "Genres"),
                    iconBg: "bg-purple-500/20",
                    iconHover: "group-hover:bg-purple-500/30",
                    iconTextColor: "text-purple-400",
                  },
                  {
                    key: "stats-rating-card",
                    id: "stats-rating-card",
                    icon: Star,
                    iconColor: "yellow",
                    value: isMounted ? stats.avgRating : "0.0",
                    label: dyn.v3.getVariant("stats_rating_label", undefined, "Avg Rating"),
                    iconBg: "bg-yellow-500/20",
                    iconHover: "group-hover:bg-yellow-500/30",
                    iconTextColor: "text-yellow-400",
                  },
                  {
                    key: "stats-duration-card",
                    id: "stats-duration-card",
                    icon: Clock,
                    iconColor: "blue",
                    value: isMounted ? `${stats.avgDuration}m` : "0m",
                    label: dyn.v3.getVariant("stats_duration_label", undefined, "Avg Duration"),
                    iconBg: "bg-blue-500/20",
                    iconHover: "group-hover:bg-blue-500/30",
                    iconTextColor: "text-blue-400",
                  },
                ];

                // Generate dynamic order using the generic function
                // count = 4 (Movies, Genres, Rating, Duration)
                const order = dyn.v1.changeOrderElements("stats-cards", statsCards.length);
                const orderedCards = order.map(i => statsCards[i]);

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {orderedCards.map((card, index) => {
                      const IconComponent = card.icon;
                      return dyn.v1.addWrapDecoy(card.key, (
                        <div
                          key={`${card.key}-${index}`}
                          id={dyn.v3.getVariant(card.id, ID_VARIANTS_MAP, card.id)}
                          data-dyn-key={card.key}
                          className={cn(
                            "group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105",
                            dyn.v3.getVariant("stats-card", CLASS_VARIANTS_MAP, "")
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl mb-3 transition-colors",
                            card.iconBg,
                            card.iconHover,
                            dyn.v3.getVariant("stats-icon-container", CLASS_VARIANTS_MAP, "")
                          )}>
                            <IconComponent className={cn("h-5 w-5", card.iconTextColor, dyn.v3.getVariant(`icon-${card.iconColor}`, CLASS_VARIANTS_MAP, ""))} />
                          </div>
                          <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                            {card.value}
                          </div>
                          <div className="text-xs text-white/60 font-medium uppercase tracking-wider text-center min-h-[16px]">
                            {card.label}
                          </div>
                        </div>
                      ));
                    })}
                  </div>
                );
              })()}

              {/* Featured Movies */}
              <div>
                {dyn.v1.addWrapDecoy("home-featured-header", (
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      id={dyn.v3.getVariant("featured-header-icon-container", ID_VARIANTS_MAP, "featured-header-icon-container")}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20",
                        dyn.v3.getVariant("header-icon-container", CLASS_VARIANTS_MAP, "")
                      )}
                    >
                      <TrendingUp
                        id={dyn.v3.getVariant("featured-header-icon", ID_VARIANTS_MAP, "featured-header-icon")}
                        className={cn(
                          "h-5 w-5 text-secondary",
                          dyn.v3.getVariant("icon-trending-up", CLASS_VARIANTS_MAP, "")
                        )}
                      />
                    </div>
                    <h2 id={dyn.v3.getVariant("featured-section-title", ID_VARIANTS_MAP, "featured-section-title")} className="text-3xl font-bold text-white">
                      {dyn.v3.getVariant("featured_title", undefined, "Featured This Week")}
                    </h2>
                  </div>
                ))}
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {(() => {
                    // Get the first 3 movies
                    const moviesToShow = featuredMovies.slice(0, 3);
                    
                    // Generate dynamic order using the generic function
                    // count = 3 (3 movies)
                    const order = dyn.v1.changeOrderElements("featured-movies", moviesToShow.length);
                    const orderedMovies = order.map(i => ({ movie: moviesToShow[i], originalIndex: i }));

                    return orderedMovies.map(({ movie, originalIndex }, displayIndex) => (
                      dyn.v1.addWrapDecoy(`featured-movie-${originalIndex}`, (
                        <div
                          key={movie.id}
                          id={dyn.v3.getVariant(displayIndex > 0 ? `featured-movie-card-${displayIndex}` : "featured-movie-card", ID_VARIANTS_MAP, displayIndex > 0 ? `featured-movie-card-${displayIndex}` : "featured-movie-card")}
                          suppressHydrationWarning
                          className={cn(
                            "group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-1",
                            dyn.v3.getVariant("featured-movie-card", CLASS_VARIANTS_MAP, "")
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
                            {dyn.v1.addWrapDecoy(`featured-movie-badges-${originalIndex}`, (
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {dyn.v1.addWrapDecoy(`featured-movie-genre-badge-${originalIndex}`, (
                                  <span
                                    id={dyn.v3.getVariant(displayIndex > 0 ? `featured-movie-genre-${displayIndex}` : "featured-movie-genre", ID_VARIANTS_MAP, displayIndex > 0 ? `featured-movie-genre-${displayIndex}` : "featured-movie-genre")}
                                    className={cn(
                                      "rounded-full bg-secondary/30 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-secondary border border-secondary/30",
                                      dyn.v3.getVariant("genre-badge", CLASS_VARIANTS_MAP, "")
                                    )}
                                  >
                                    {movie.genres[0] || "Cinematic"}
                                  </span>
                                ))}
                                {dyn.v1.addWrapDecoy(`featured-movie-rating-badge-${originalIndex}`, (
                                  <div
                                    id={dyn.v3.getVariant(displayIndex > 0 ? `featured-movie-rating-${displayIndex}` : "featured-movie-rating", ID_VARIANTS_MAP, displayIndex > 0 ? `featured-movie-rating-${displayIndex}` : "featured-movie-rating")}
                                    className={cn(
                                      "flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/10",
                                      dyn.v3.getVariant("rating-badge", CLASS_VARIANTS_MAP, "")
                                    )}
                                  >
                                    <Star className={cn("h-3.5 w-3.5 fill-yellow-400 text-yellow-400", dyn.v3.getVariant("icon-star-small", CLASS_VARIANTS_MAP, ""))} />
                                    {movie.rating}
                                  </div>
                                ))}
                              </div>
                            ))}
                            
                            {/* Title */}
                            <h3
                              id={dyn.v3.getVariant(displayIndex > 0 ? `featured-movie-title-${displayIndex}` : "featured-movie-title", ID_VARIANTS_MAP, displayIndex > 0 ? `featured-movie-title-${displayIndex}` : "featured-movie-title")}
                              className={cn(
                                "text-2xl lg:text-3xl font-bold leading-tight mb-3 drop-shadow-lg",
                                dyn.v3.getVariant("movie-title", CLASS_VARIANTS_MAP, "")
                              )}
                            >
                              {movie.title}
                            </h3>
                            
                            {/* Synopsis */}
                            <p
                              id={dyn.v3.getVariant(displayIndex > 0 ? `featured-movie-synopsis-${displayIndex}` : "featured-movie-synopsis", ID_VARIANTS_MAP, displayIndex > 0 ? `featured-movie-synopsis-${displayIndex}` : "featured-movie-synopsis")}
                              className={cn(
                                "text-sm lg:text-base text-white/90 mb-4 line-clamp-2 leading-relaxed",
                                dyn.v3.getVariant("movie-synopsis", CLASS_VARIANTS_MAP, "")
                              )}
                            >
                              {movie.synopsis}
                            </p>
                            
                            {/* Meta info */}
                            <div
                              id={dyn.v3.getVariant(displayIndex > 0 ? `featured-movie-meta-${displayIndex}` : "featured-movie-meta", ID_VARIANTS_MAP, displayIndex > 0 ? `featured-movie-meta-${displayIndex}` : "featured-movie-meta")}
                              className={cn(
                                "flex items-center gap-3 text-xs lg:text-sm text-white/80 mb-5 font-medium",
                                dyn.v3.getVariant("movie-meta", CLASS_VARIANTS_MAP, "")
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
                              id={dyn.v3.getVariant(displayIndex > 0 ? `featured-movie-view-details-btn-${displayIndex}` : "featured-movie-view-details-btn", ID_VARIANTS_MAP, displayIndex > 0 ? `featured-movie-view-details-btn-${displayIndex}` : "featured-movie-view-details-btn")}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:bg-secondary/90 hover:scale-105 shadow-lg shadow-secondary/20 whitespace-nowrap min-w-[120px]"
                            >
                              <Play className="h-4 w-4" />
                              {dyn.v3.getVariant("view_details", undefined, "View Details")}
                            </SeedLink>
                          </div>
                        </div>
                      </div>
                    ), undefined, movie.id)
                    ));
                  })()}
                </div>
              </div>
            </div>
            </div>
          ))}

          {/* Popular Genres - Only dynamic ordering, no V1 wrappers/decoys */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id={dyn.v3.getVariant("genres-title", ID_VARIANTS_MAP, "genres-title")} className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {dyn.v3.getVariant("browse_genres", undefined, "Browse by Genre")}
                </h2>
                <p className="text-white/70">
                  {dyn.v3.getVariant("genres_description", undefined, "Explore movies by your favorite genre")}
                </p>
              </div>
              <SeedLink
                href="/search"
                className="hidden md:flex items-center gap-2 text-secondary hover:text-secondary/80 font-semibold transition-colors"
              >
                {dyn.v3.getVariant("view_all", undefined, "View All")}
                <ArrowRight className="h-4 w-4" />
              </SeedLink>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {orderedGenres.map((genre, displayIndex) => {
                  const genreMovies = getMoviesByGenre(genre);
                  return (
                    <SeedLink
                      key={genre}
                      href={`/search?genre=${encodeURIComponent(genre)}`}
                      id={dyn.v3.getVariant(displayIndex > 0 ? `genre-card-${displayIndex}` : "genre-card", ID_VARIANTS_MAP, displayIndex > 0 ? `genre-card-${displayIndex}` : "genre-card")}
                      className={cn(
                        "group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 sm:p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105 text-center w-full",
                        dyn.v3.getVariant("genre-card", CLASS_VARIANTS_MAP, "")
                      )}
                    >
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/20 mb-3 mx-auto group-hover:bg-secondary/30 transition-colors">
                        <Film className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                      </div>
                      <h3 className="font-bold text-white mb-1 text-sm sm:text-base truncate">{genre}</h3>
                      <p className="text-xs text-white/60">
                        {genreMovies.length} {dyn.v3.getVariant("movies_label", undefined, "movies")}
                      </p>
                    </SeedLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Features Section */}
          {dyn.v1.addWrapDecoy("home-features-section", (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 rounded-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm">
                {dyn.v1.addWrapDecoy("home-features-header", (
                  <div className="text-center mb-12">
                    <h2 id={dyn.v3.getVariant("features-title", ID_VARIANTS_MAP, "features-title")} className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {dyn.v3.getVariant("why_choose", dynamicV3TextVariants)}
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-400">
                        Autocinema?
                      </span>
                    </h2>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                      {dyn.v3.getVariant("features_description", dynamicV3TextVariants)}
                    </p>
                  </div>
                ))}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {orderedFeatures.map((feature, displayIndex) => (
                    dyn.v1.addWrapDecoy(`feature-card-${displayIndex}`, (
                      <div
                        key={feature.key}
                        id={dyn.v3.getVariant(displayIndex > 0 ? `feature-card-${displayIndex}` : "feature-card", ID_VARIANTS_MAP, displayIndex > 0 ? `feature-card-${displayIndex}` : "feature-card")}
                        className={cn(
                          "group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:-translate-y-1 w-full h-full",
                          dyn.v3.getVariant("feature-card", CLASS_VARIANTS_MAP, "")
                        )}
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 mb-4 group-hover:bg-secondary/30 transition-colors">
                          <div className="text-secondary">{feature.icon}</div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {dyn.v3.getVariant(`${feature.key}_title`, dynamicV3TextVariants)}
                        </h3>
                        <p className="text-sm text-white/70">
                          {dyn.v3.getVariant(`${feature.key}_description`, dynamicV3TextVariants)}
                        </p>
                      </div>
                    ), undefined, `feature-${displayIndex}`)
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
          {dyn.v1.addWrapDecoy("home-cta-section", (
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent p-12 text-center backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.2),transparent_70%)]" />
              <div className="relative">
                <TrendingUp className="h-16 w-16 text-secondary mx-auto mb-6" />
                <h2 id={dyn.v3.getVariant("cta-title", ID_VARIANTS_MAP, "cta-title")} className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {dyn.v3.getVariant("cta_title", dynamicV3TextVariants)}
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  {dyn.v3.getVariant("cta_description", dynamicV3TextVariants)}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SeedLink href="/search">
                    <Button className={cn("h-14 px-8 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105", dyn.v3.getVariant("go-to-search-button", CLASS_VARIANTS_MAP, ""))}>
                      <Search className="h-5 w-5 mr-2" />
                      {dyn.v3.getVariant("go_to_search", dynamicV3TextVariants)}
                    </Button>
                  </SeedLink>
                  <SeedLink href="/about">
                    <Button
                      variant="outline"
                      id={dyn.v3.getVariant("learn-more-button", ID_VARIANTS_MAP, "learn-more-button")}
                      className={cn("h-14 px-8 border-white/20 bg-white/10 text-white hover:bg-white/20 font-semibold text-base backdrop-blur-sm", dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, ""))}
                    >
                      {dyn.v3.getVariant("learn_more", dynamicV3TextVariants)}
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
