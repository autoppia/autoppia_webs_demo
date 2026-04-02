"use client";
import RestaurantCard from './RestaurantCard';
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchStore } from '@/store/search-store';
import { useLayout } from '@/contexts/LayoutProvider';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Loader2, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useEffect, useState } from "react";
import QuickOrderModal from "./QuickOrderModal";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

export default function RestaurantsListPage() {
  const layout = useLayout();
  const dyn = useDynamicSystem();
  const [isClientMounted, setIsClientMounted] = useState(false);
  const search = useSearchStore(s => s.search);
  const setSearch = useSearchStore(s => s.setSearch);
  const cuisine = useSearchStore(s => s.cuisine);
  const setCuisine = useSearchStore(s => s.setCuisine);
  const rating = useSearchStore(s => s.rating);
  const setRating = useSearchStore(s => s.setRating);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);

  const { restaurants, isLoading } = useRestaurants();
  const cuisineOptions = Array.from(new Set(restaurants.map((r) => r.cuisine)));
  const featuredCuisineChips = cuisineOptions.slice(0, 6);
  // Offer granular filters even if most items are high-rated
  const ratingOptions = [2.5, 3, 3.5, 4, 4.5, 5];

  const filtered = restaurants.filter((r) => {
    const text = search.trim().toLowerCase();
    return (
      (!text ||
        r.name.toLowerCase().includes(text) ||
        r.cuisine.toLowerCase().includes(text) ||
        (Array.isArray(r.menu) && r.menu.some((m) => m.name.toLowerCase().includes(text)))) &&
      (!cuisine || r.cuisine === cuisine) &&
      (!rating || r.rating >= Number.parseFloat(rating))
    );
  });

  // Reset pagination on filter changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, cuisine, rating]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  const isFiltered = !!search || cuisine || rating;

  // Log SEARCH_RESTAURANT event when user searches
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (!restaurants.length) return;
    if (!search.trim()) return;

    const timeoutId = setTimeout(() => {
      logEvent(EVENT_TYPES.SEARCH_RESTAURANT, {
        query: search.trim(),
        total_results: filtered.length,
        has_cuisine_filter: !!cuisine,
        has_rating_filter: !!rating,
      });
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [search, restaurants.length, filtered.length, cuisine, rating]);

  useEffect(() => {
    if (!restaurants.length) return;
    if (!search && !cuisine && !rating) return;
    logEvent(EVENT_TYPES.RESTAURANT_FILTER, {
      search: search.trim(),
      cuisine: cuisine || null,
      rating: rating ? Number(rating) : null,
      total: filtered.length,
    });
  }, [search, cuisine, rating, filtered.length, restaurants.length]);

  // Listen to global quick-order trigger from navbar
  useEffect(() => {
    const handler = () => setQuickOrderOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("autodelivery:openQuickOrder", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("autodelivery:openQuickOrder", handler);
      }
    };
  }, []);

  if (isLoading && restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white py-16 shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Prevent hydration mismatch when SSR has empty provider data but client rehydrates
  // with loaded restaurants before first paint.
  if (!isClientMounted) {
    return (
      <div className="flex items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white py-16 shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    dyn.v1.addWrapDecoy("restaurants-list-page", (
    <section
      className={layout.generateSeedClass('restaurants-section')}
      {...layout.getElementAttributes('restaurants-section', 0)}
    >
      {dyn.v1.addWrapDecoy("search-filters", (
      <div
        className={`mb-8 rounded-3xl border-2 border-zinc-300 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 px-4 py-4 shadow-md backdrop-blur md:px-5 md:py-5 ${layout.searchBar.containerClass} ${dyn.v3.getVariant('search-filters-container', CLASS_VARIANTS_MAP, '')}`}
        id={dyn.v3.getVariant('search-filters', ID_VARIANTS_MAP, 'search-filters')}
        {...layout.getElementAttributes('search-filters', 0)}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Find your next meal
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-700" />
            Live filters
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
            <Input
              type="text"
              placeholder={dyn.v3.getVariant("search_placeholder", TEXT_VARIANTS_MAP, "Search by name, cuisine, or menu...")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  logEvent(EVENT_TYPES.SEARCH_RESTAURANT, {
                    query: search.trim(),
                    total_results: filtered.length,
                    trigger: 'enter_key',
                  });
                }
              }}
              className={`h-12 flex-1 rounded-2xl border-2 border-zinc-400 bg-white pl-10 shadow-sm focus-visible:border-emerald-600 focus-visible:ring-emerald-600 ${layout.searchBar.inputClass} ${dyn.v3.getVariant("search-input", CLASS_VARIANTS_MAP, "")}`}
              id={dyn.v3.getVariant('search-input', ID_VARIANTS_MAP, 'search-input')}
              {...layout.getElementAttributes('search-input', 0)}
            />
          </div>
          <div className="flex w-full gap-3 lg:w-auto lg:shrink-0">
            <Select value={cuisine || "all"} onValueChange={v => setCuisine(v === "all" ? "" : v)}>
              <SelectTrigger
                className={`h-12 w-full rounded-2xl border-2 border-zinc-400 bg-white shadow-sm sm:w-44 focus:border-emerald-600 ${layout.generateSeedClass('cuisine-select')} ${dyn.v3.getVariant("cuisine-select", CLASS_VARIANTS_MAP, "")}`}
                {...layout.getElementAttributes('cuisine-select', 0)}
              >
                <SelectValue placeholder="All cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">All cuisines</SelectItem>
                {cuisineOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rating || "all"} onValueChange={v => setRating(v === "all" ? "" : v)}>
              <SelectTrigger
                className={`h-12 w-full rounded-2xl border-2 border-zinc-400 bg-white shadow-sm sm:w-36 focus:border-emerald-600 ${layout.generateSeedClass('rating-select')} ${dyn.v3.getVariant("rating-select", CLASS_VARIANTS_MAP, "")}`}
                {...layout.getElementAttributes('rating-select', 0)}
              >
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">All ratings</SelectItem>
                {ratingOptions.map(opt => (
                  <SelectItem key={opt} value={opt.toString()}>{opt}+</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-zinc-200 pt-3">
          <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Popular:</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setRating("4.5")}
            className="h-8 rounded-full border-2 border-amber-600 bg-amber-50 px-3 text-xs font-semibold text-amber-950 hover:bg-amber-100"
          >
            4.5+ Rated
          </Button>
          {featuredCuisineChips.map((chip) => (
            <Button
              key={chip}
              type="button"
              variant="ghost"
              onClick={() => setCuisine(chip)}
              className={`h-8 rounded-full border px-3 text-xs font-semibold transition-colors ${
                cuisine === chip
                  ? "border-2 border-emerald-700 bg-emerald-100 text-emerald-950"
                  : "border-2 border-zinc-400 bg-white text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              {chip}
            </Button>
          ))}
        </div>
        {isFiltered && (
          <div className="mt-4 flex justify-end border-t-2 border-zinc-200 pt-3">
            <Button
              type="button"
              variant="ghost"
              className={`h-9 rounded-full border-2 border-zinc-500 px-4 font-semibold text-zinc-800 hover:bg-zinc-100 ${layout.generateSeedClass('reset-filters-btn')} ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")} ${dyn.v3.getVariant('reset-filters-btn-class', CLASS_VARIANTS_MAP, '')}`}
              id={dyn.v3.getVariant('reset-filters-btn', ID_VARIANTS_MAP, 'reset-filters-btn')}
              onClick={() => {
                setSearch("");
                setCuisine("");
                setRating("");
              }}
              {...layout.getElementAttributes('reset-filters-btn', 0)}
            >
              {dyn.v3.getVariant('reset-filters-btn-text', TEXT_VARIANTS_MAP, 'Reset filters')}
            </Button>
          </div>
        )}
      </div>
      ))}
      {dyn.v1.addWrapDecoy("restaurants-grid", (
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${layout.grid.containerClass} ${dyn.v3.getVariant('restaurants-grid-class', CLASS_VARIANTS_MAP, '')}`}
        id={dyn.v3.getVariant('restaurants-grid', ID_VARIANTS_MAP, 'restaurants-grid')}
        {...layout.getElementAttributes('restaurants-grid', 0)}
      >
        {paginated.length > 0 ? (
          (() => {
            const ordered = dyn.v1.changeOrderElements("restaurants-grid", paginated.length);
            return ordered.map((orderIndex) => {
              const r = paginated[orderIndex];
              const index = orderIndex;
              return (
            <div
              key={r.id}
              className={`${layout.grid.itemClass} ${dyn.v3.getVariant('restaurant-grid-item-class', CLASS_VARIANTS_MAP, '')}`}
              id={dyn.v3.getVariant(`restaurant-grid-item-${index}`, ID_VARIANTS_MAP, `restaurant-grid-item-${index}`)}
              {...layout.getElementAttributes('restaurant-grid-item', index)}
            >
              <RestaurantCard
                id={r.id}
                name={r.name}
                image={r.image}
                cuisine={r.cuisine}
                rating={r.rating}
                description={r.description}
              />
            </div>
              );
            });
          })()
        ) : (
          <div
            className={`col-span-full rounded-2xl border-2 border-zinc-300 bg-white py-16 text-center text-lg text-zinc-600 shadow-sm ${layout.generateSeedClass('no-restaurants-message')} ${dyn.v3.getVariant('no-restaurants-message-class', CLASS_VARIANTS_MAP, '')}`}
            id={dyn.v3.getVariant('no-restaurants-message', ID_VARIANTS_MAP, 'no-restaurants-message')}
            {...layout.getElementAttributes('no-restaurants-message', 0)}
          >
            {dyn.v3.getVariant('no-restaurants-message-text', TEXT_VARIANTS_MAP, 'No restaurants found.')}
          </div>
        )}
      </div>
      ))}

      {filtered.length > itemsPerPage && (
        <div className={`mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-zinc-300 bg-white px-4 py-3 shadow-sm md:flex-row ${dyn.v3.getVariant('pagination-container-class', CLASS_VARIANTS_MAP, '')}`} id={dyn.v3.getVariant('pagination-container', ID_VARIANTS_MAP, 'pagination-container')}>
          <div className={dyn.v3.getVariant('pagination-info-class', CLASS_VARIANTS_MAP, 'text-sm text-muted-foreground')}>
            {dyn.v3.getVariant('pagination-info-text', TEXT_VARIANTS_MAP, `Showing ${startIndex + 1}–${Math.min(endIndex, filtered.length)} of ${filtered.length}`)}
          </div>
          <div className={`flex items-center gap-2 ${dyn.v3.getVariant('pagination-buttons-wrapper-class', CLASS_VARIANTS_MAP, '')}`}>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => {
                if (page === 1) return;
                logEvent(EVENT_TYPES.RESTAURANT_PREV_PAGE, {
                  from_page: page,
                  to_page: page - 1,
                  page_size: itemsPerPage,
                  total_items: filtered.length,
                });
                setPage((p) => Math.max(1, p - 1));
              }}
              id={dyn.v3.getVariant('pagination-prev', ID_VARIANTS_MAP, 'pagination-prev')}
              className={dyn.v3.getVariant('pagination-prev-class', CLASS_VARIANTS_MAP, '')}
              {...layout.getElementAttributes('pagination-prev', 0)}
            >
              {dyn.v3.getVariant('pagination-prev-text', TEXT_VARIANTS_MAP, 'Prev')}
            </Button>
            <div className={dyn.v3.getVariant('pagination-page-info-class', CLASS_VARIANTS_MAP, 'text-sm font-medium')}>
              {dyn.v3.getVariant('pagination-page-info-text', TEXT_VARIANTS_MAP, `Page ${page} of ${totalPages}`)}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => {
                if (page === totalPages) return;
                logEvent(EVENT_TYPES.RESTAURANT_NEXT_PAGE, {
                  from_page: page,
                  to_page: page + 1,
                  page_size: itemsPerPage,
                  total_items: filtered.length,
                });
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              id={dyn.v3.getVariant('pagination-next', ID_VARIANTS_MAP, 'pagination-next')}
              className={dyn.v3.getVariant('pagination-next-class', CLASS_VARIANTS_MAP, '')}
              {...layout.getElementAttributes('pagination-next', 0)}
            >
              {dyn.v3.getVariant('pagination-next-text', TEXT_VARIANTS_MAP, 'Next')}
            </Button>
          </div>
        </div>
      )}
      <QuickOrderModal open={quickOrderOpen} onOpenChange={setQuickOrderOpen} />
    </section>
    ))
  );
}
