"use client";

import { useMemo, useState } from "react";
import { SpotlightRow } from "@/components/movies/SpotlightRow";
import { getFeaturedBooks, getBooksByGenre, getAvailableGenres, getBooks } from "@/dynamic/v2-data";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { Search, BookOpen, Star, TrendingUp, Sparkles, ArrowRight, Book, Calendar } from "lucide-react";
import { SeedLink } from "@/components/ui/SeedLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HomeContent() {
  const router = useSeedRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredBooks = useMemo(() => getFeaturedBooks(6), []);
  const allBooks = useMemo(() => getBooks(), []);
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

  // Get books by different genres for spotlight sections
  const dramaFocus = useMemo(() => getBooksByGenre("Drama").slice(0, 5), []);
  const thrillerFocus = useMemo(() => getBooksByGenre("Thriller").slice(0, 5), []);
  const fictionFocus = useMemo(() => getBooksByGenre("Fiction").slice(0, 5), []);
  const romanceFocus = useMemo(() => getBooksByGenre("Romance").slice(0, 5), []);

  // Get popular genres (top 6 by book count)
  const popularGenres = useMemo(() => {
    const genreCounts = genres.map((genre) => ({
      genre,
      count: getBooksByGenre(genre).length,
    }));
    return genreCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((g) => g.genre);
  }, [genres]);

  // Calculate stats
  const stats = useMemo(() => {
    if (allBooks.length === 0) {
      return {
        totalBooks: 0,
        totalGenres: 0,
        avgRating: "0.0",
        avgPages: 0,
      };
    }
    const totalPages = allBooks.reduce((acc, book) => acc + (book.duration || 0), 0);
    const totalRating = allBooks.reduce((acc, book) => acc + book.rating, 0);
    return {
      totalBooks: allBooks.length,
      totalGenres: genres.length,
      avgRating: (totalRating / allBooks.length).toFixed(1),
      avgPages: Math.round(totalPages / allBooks.length),
    };
  }, [allBooks, genres]);

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Smart Search",
      description: "Find books instantly by title, author, or any keyword",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Vast Collection",
      description: "Explore thousands of books across all genres",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Curated Picks",
      description: "Hand-selected featured books updated weekly",
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
          <div className="relative">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-secondary/10 rounded-3xl blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0 rounded-3xl" />
            
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm">
              {/* Header Section */}
              <div className="text-center mb-10">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                  Autobooks
                </h2>
                <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Your intelligent book search engine. Discover thousands of books, explore by genre, and find your next reading adventure.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-10 w-full">
                <form
                  className="flex flex-col gap-3 sm:flex-row w-full"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSearchSubmit();
                  }}
                >
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search authors, titles, or keywords"
                      className="pl-12 h-14 w-full min-w-0 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-14 min-w-[120px] px-8 bg-secondary text-black hover:bg-secondary/90 shadow-lg shadow-secondary/20 font-semibold text-base whitespace-nowrap"
                  >
                    Search
                  </Button>
                </form>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20 mb-3 group-hover:bg-secondary/30 transition-colors">
                    <BookOpen className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.totalBooks}+</div>
                  <div className="text-xs text-white/60 font-medium uppercase tracking-wider text-center">Books</div>
                </div>

                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 mb-3 group-hover:bg-purple-500/30 transition-colors">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.totalGenres}</div>
                  <div className="text-xs text-white/60 font-medium uppercase tracking-wider text-center">Genres</div>
                </div>

                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/20 mb-3 group-hover:bg-yellow-500/30 transition-colors">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.avgRating}</div>
                  <div className="text-xs text-white/60 font-medium uppercase tracking-wider text-center">Avg Rating</div>
                </div>

                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 mb-3 group-hover:bg-blue-500/30 transition-colors">
                    <Book className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.avgPages}</div>
                  <div className="text-xs text-white/60 font-medium uppercase tracking-wider text-center">Avg Pages</div>
                </div>
              </div>

              {/* Featured Books */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Featured This Week</h2>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredBooks.slice(0, 3).map((book) => (
                    <div
                      key={book.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/30 hover:-translate-y-1"
                    >
                      {/* Book cover with overlay */}
                      <div
                        className="relative overflow-hidden bg-cover bg-center aspect-[2/3] transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${book.poster}), url('/media/gallery/default_book.png')`,
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
                              {book.genres[0] || "Fiction"}
                            </span>
                            <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/10">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              {book.rating}
                            </div>
                          </div>
                          
                          {/* Title */}
                          <h3 className="text-2xl lg:text-3xl font-bold leading-tight mb-3 drop-shadow-lg">
                            {book.title}
                          </h3>
                          
                          {/* Synopsis */}
                          <p className="text-sm lg:text-base text-white/90 mb-4 line-clamp-2 leading-relaxed">
                            {book.synopsis}
                          </p>
                          
                          {/* Meta info */}
                          <div className="flex items-center gap-3 text-xs lg:text-sm text-white/80 mb-5 font-medium">
                            <span>{book.year}</span>
                            <span className="text-white/40">•</span>
                            <span>{book.duration} pages</span>
                            <span className="text-white/40">•</span>
                            <span className="truncate">{book.director}</span>
                          </div>
                          
                          {/* CTA Button */}
                          <SeedLink
                            href={`/books/${book.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-black transition-all hover:bg-secondary/90 hover:scale-105 shadow-lg shadow-secondary/20 whitespace-nowrap min-w-[120px]"
                          >
                            <BookOpen className="h-4 w-4" />
                            View Details
                          </SeedLink>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Popular Genres */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Browse by Genre
                </h2>
                <p className="text-white/70">
                  Explore books by your favorite genre
                </p>
              </div>
              <SeedLink
                href="/search"
                className="hidden md:flex items-center gap-2 text-secondary hover:text-secondary/80 font-semibold transition-colors"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </SeedLink>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {popularGenres.map((genre) => {
                  const genreBooks = getBooksByGenre(genre);
                  return (
                    <SeedLink
                      key={genre}
                      href={`/search?genre=${encodeURIComponent(genre)}`}
                      className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 sm:p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:scale-105 text-center w-full"
                    >
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/20 mb-3 mx-auto group-hover:bg-secondary/30 transition-colors">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                      </div>
                      <h3 className="font-bold text-white mb-1 text-sm sm:text-base truncate">{genre}</h3>
                      <p className="text-xs text-white/60">
                        {genreBooks.length} books
                      </p>
                    </SeedLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 rounded-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Why Choose
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-400">
                    Autobooks?
                  </span>
                </h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  The ultimate book discovery platform designed for book lovers
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:bg-white/10 hover:-translate-y-1 w-full h-full"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 mb-4 group-hover:bg-secondary/30 transition-colors">
                      <div className="text-secondary">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spotlight sections */}
          <div className="space-y-12">
            {dramaFocus.length > 0 && (
              <SpotlightRow
                title="Drama focus"
                description="Slow burns, futuristic romances, and everything in between"
                movies={dramaFocus}
              />
            )}
            {thrillerFocus.length > 0 && (
              <SpotlightRow
                title="Thriller lab"
                description="High-tension reads sourced from the dataset variant you picked"
                movies={thrillerFocus}
              />
            )}
            {fictionFocus.length > 0 && (
              <SpotlightRow
                title="Fiction collection"
                description="Literary masterpieces and contemporary fiction"
                movies={fictionFocus}
              />
            )}
            {romanceFocus.length > 0 && (
              <SpotlightRow
                title="Romance reads"
                description="Love stories and heartwarming tales"
                movies={romanceFocus}
              />
            )}
          </div>

          {/* CTA Section */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent p-12 text-center backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.2),transparent_70%)]" />
            <div className="relative">
              <TrendingUp className="h-16 w-16 text-secondary mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to explore?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Start searching for books now and discover your next favorite story
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SeedLink href="/search">
                  <Button className="h-14 px-8 bg-secondary text-black hover:bg-secondary/90 font-bold text-base shadow-lg shadow-secondary/20 transition-all hover:scale-105">
                    <Search className="h-5 w-5 mr-2" />
                    Go to Search
                  </Button>
                </SeedLink>
                <SeedLink href="/about">
                  <Button
                    variant="outline"
                    className="h-14 px-8 border-white/20 bg-white/10 text-white hover:bg-white/20 font-semibold text-base backdrop-blur-sm"
                  >
                    Learn More
                  </Button>
                </SeedLink>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
