"use client";
import RestaurantCard from './RestaurantCard';
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchStore } from '@/store/search-store';
import { useLayout } from '@/contexts/LayoutProvider';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Loader2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/components/library/events";
import { useEffect, useState } from "react";
import QuickOrderModal from "./QuickOrderModal";
import { useV3Attributes } from "@/dynamic/v3-dynamic";

export default function RestaurantsListPage() {
  const layout = useLayout();
  const { getText, getId, getAria } = useV3Attributes();
  const search = useSearchStore(s => s.search);
  const setSearch = useSearchStore(s => s.setSearch);
  const cuisine = useSearchStore(s => s.cuisine);
  const setCuisine = useSearchStore(s => s.setCuisine);
  const rating = useSearchStore(s => s.rating);
  const setRating = useSearchStore(s => s.setRating);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);

  const { restaurants, isLoading } = useRestaurants();
  const cuisineOptions = Array.from(new Set(restaurants.map((r) => r.cuisine)));
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
      (!rating || r.rating >= parseFloat(rating))
    );
  });

  // Reset pagination on filter changes
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <section 
      className={layout.generateSeedClass('restaurants-section')}
      {...layout.getElementAttributes('restaurants-section', 0)}
    >
      <div 
        className={`mb-8 bg-white/80 backdrop-blur border border-zinc-200/70 shadow-sm rounded-xl px-4 py-3 flex flex-col gap-3 ${layout.searchBar.containerClass}`}
        {...layout.getElementAttributes('search-filters', 0)}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <Input
            type="text"
            placeholder="Search by name, cuisine, or menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`flex-1 rounded-lg border-zinc-200 shadow-xs focus:ring-2 focus:ring-emerald-500 ${layout.searchBar.inputClass}`}
            {...layout.getElementAttributes('search-input', 0)}
          />
          <div className="flex flex-row gap-3 shrink-0">
            <Select value={cuisine || "all"} onValueChange={v => setCuisine(v === "all" ? "" : v)}>
              <SelectTrigger 
                className={`w-44 rounded-lg border-zinc-200 shadow-xs ${layout.generateSeedClass('cuisine-select')}`}
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
                className={`w-36 rounded-lg border-zinc-200 shadow-xs ${layout.generateSeedClass('rating-select')}`}
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
        {isFiltered && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              className={`text-emerald-700 hover:text-emerald-800 ${layout.generateSeedClass('reset-filters-btn')}`}
              onClick={() => {
                setSearch("");
                setCuisine("");
                setRating("");
              }}
              {...layout.getElementAttributes('reset-filters-btn', 0)}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>
      <div 
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 ${layout.grid.containerClass}`}
        {...layout.getElementAttributes('restaurants-grid', 0)}
      >
        {paginated.length > 0 ? (
          paginated.map((r, index) => (
            <div
              key={r.id}
              className={layout.grid.itemClass}
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
          ))
        ) : (
          <div 
            className={`text-zinc-400 text-center col-span-full py-16 text-lg ${layout.generateSeedClass('no-restaurants-message')}`}
            {...layout.getElementAttributes('no-restaurants-message', 0)}
          >
            No restaurants found.
          </div>
        )}
      </div>

      {filtered.length > itemsPerPage && (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              {...layout.getElementAttributes('pagination-prev', 0)}
            >
              Prev
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              {...layout.getElementAttributes('pagination-next', 0)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <QuickOrderModal open={quickOrderOpen} onOpenChange={setQuickOrderOpen} />
    </section>
  );
}
