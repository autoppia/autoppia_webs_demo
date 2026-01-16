"use client";

import { BookOpen, Search, Filter, Star, Calendar, Book, Users, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useMemo } from "react";
import { getAvailableGenres, getAvailableYears, getBooks } from "@/dynamic/v2";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export function AboutSection() {
  const books = useMemo(() => getBooks(), []);
  const genres = useMemo(() => getAvailableGenres(), []);
  const years = useMemo(() => getAvailableYears(), []);
  const dyn = useDynamicSystem();

  const stats = useMemo(() => {
    if (books.length === 0) {
      return {
        totalBooks: 0,
        totalGenres: 0,
        avgRating: "0.0",
        avgPages: 0,
        yearRange: "N/A",
      };
    }

    const totalPages = books.reduce((acc, book) => acc + (book.duration || 0), 0);
    const totalRating = books.reduce((acc, book) => acc + book.rating, 0);
    const minYear = Math.min(...books.map((b) => b.year));
    const maxYear = Math.max(...books.map((b) => b.year));

    return {
      totalBooks: books.length,
      totalGenres: genres.length,
      avgRating: (totalRating / books.length).toFixed(1),
      avgPages: Math.round(totalPages / books.length),
      yearRange: minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`,
    };
  }, [books, genres]);

  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Smart Search",
      description: "Find books by title, author, genre, or year. Our search engine helps you discover exactly what you're looking for.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: <Filter className="h-8 w-8" />,
      title: "Advanced Filters",
      description: "Filter by genre, publication year, pages, and more. Combine multiple filters to find your perfect book.",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Complete Catalog",
      description: "Explore thousands of books with detailed information: synopsis, authors, genres, ratings, and much more.",
      gradient: "from-orange-500/20 to-red-500/20",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Featured Books",
      description: "Discover the best books specially selected for you. New recommendations every week.",
      gradient: "from-yellow-500/20 to-amber-500/20",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Search",
      description: "Type in the search bar the title, author, or any keyword related to the book you're looking for.",
      icon: <Search className="h-6 w-6" />,
    },
    {
      step: "02",
      title: "Filter",
      description: "Use genre and year filters to refine your search and find exactly what you need.",
      icon: <Filter className="h-6 w-6" />,
    },
    {
      step: "03",
      title: "Discover",
      description: "Explore the results, read synopses, check ratings, and find your next favorite book.",
      icon: <Sparkles className="h-6 w-6" />,
    },
  ];

  return (
    dyn.v1.addWrapDecoy("about-content", (
      <section className="space-y-20" id={dyn.v3.getVariant("about-content", ID_VARIANTS_MAP, "about-content")}>
        {/* Hero Section */}
        {dyn.v1.addWrapDecoy("about-hero", (
          <div className="relative text-center" id={dyn.v3.getVariant("about-hero", ID_VARIANTS_MAP, "about-hero")}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-secondary/5 rounded-3xl blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
                <BookOpen className="h-5 w-5 text-secondary" />
                <span className="text-sm font-semibold text-secondary">Book Search Engine</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" id={dyn.v3.getVariant("about-title", ID_VARIANTS_MAP, "about-title")}>
                Your Digital
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-yellow-400 to-secondary">
                  {dyn.v3.getVariant("about_title", TEXT_VARIANTS_MAP, "Reading Room")}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                {dyn.v3.getVariant("about_description", TEXT_VARIANTS_MAP, "Discover, search, and explore thousands of books with our intelligent search engine. Find your next favorite read in seconds.")}
              </p>
            </div>
          </div>
        ), "about-hero-wrap")}

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <div className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:scale-105">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/20 mb-4 group-hover:bg-secondary/30 transition-colors">
            <BookOpen className="h-6 w-6 text-secondary" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.totalBooks}</div>
          <div className="text-sm text-white/60 font-medium">Books</div>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:scale-105">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/20 mb-4 group-hover:bg-purple-500/30 transition-colors">
            <Sparkles className="h-6 w-6 text-purple-400" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.totalGenres}</div>
          <div className="text-sm text-white/60 font-medium">Genres</div>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:scale-105">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/20 mb-4 group-hover:bg-yellow-500/30 transition-colors">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.avgRating}</div>
          <div className="text-sm text-white/60 font-medium">Rating</div>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:scale-105">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/20 mb-4 group-hover:bg-blue-500/30 transition-colors">
            <Book className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.avgPages}</div>
          <div className="text-sm text-white/60 font-medium">Pages</div>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-secondary/50 hover:scale-105 col-span-2 md:col-span-1">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500/20 mb-4 group-hover:bg-green-500/30 transition-colors">
            <Calendar className="h-6 w-6 text-green-400" />
          </div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stats.yearRange}</div>
          <div className="text-sm text-white/60 font-medium">Years</div>
        </div>
      </div>

      {/* Features Section */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-400">
              find books
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            A powerful and easy-to-use search engine designed for book lovers and readers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm transition-all hover:border-secondary/50 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform`}>
                  <div className={feature.iconColor}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 rounded-3xl" />
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 backdrop-blur-sm">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-4">
              <Zap className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find your book in
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-400">
                3 simple steps
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute -top-4 -left-4 text-7xl font-bold text-white/5 group-hover:text-secondary/20 transition-colors">
                  {item.step}
                </div>
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm group-hover:border-secondary/50 group-hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/20 mb-4 group-hover:bg-secondary/30 transition-colors">
                    <div className="text-secondary">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {dyn.v1.addWrapDecoy("about-cta", (
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
            {dyn.v1.addWrapDecoy("about-cta-button", (
              <a
                href="/search"
                id={dyn.v3.getVariant("go-to-search-button", ID_VARIANTS_MAP, "go-to-search-button")}
                className={dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-2 rounded-xl bg-secondary px-8 py-4 text-lg font-bold text-black transition-all hover:bg-secondary/90 hover:scale-105 shadow-lg shadow-secondary/20")}
              >
                <Search className="h-5 w-5" />
                {dyn.v3.getVariant("go_to_search", TEXT_VARIANTS_MAP, "Go to Search")}
              </a>
            ), "about-cta-button-wrap")}
          </div>
        </div>
      ), "about-cta-wrap")}
    </section>
    ), "about-content-wrap")
  );
}
