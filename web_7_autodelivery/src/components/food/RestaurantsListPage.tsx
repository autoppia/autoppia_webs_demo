"use client";
import { useRestaurants } from '@/contexts/RestaurantContext';
import RestaurantCard from './RestaurantCard';
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchStore } from '@/store/search-store';
import { useLayout } from '@/contexts/LayoutProvider';

export default function RestaurantsListPage() {
  const layout = useLayout();
  const search = useSearchStore(s => s.search);
  const setSearch = useSearchStore(s => s.setSearch);
  const cuisine = useSearchStore(s => s.cuisine);
  const setCuisine = useSearchStore(s => s.setCuisine);
  const rating = useSearchStore(s => s.rating);
  const setRating = useSearchStore(s => s.setRating);

  const { restaurants } = useRestaurants();
  const cuisineOptions = Array.from(new Set(restaurants.map(r => r.cuisine)));
  const ratingOptions = [4, 4.5, 5];

  const filtered = restaurants.filter(r => {
    const text = search.trim().toLowerCase();
    return (
      (!text ||
        r.name.toLowerCase().includes(text) ||
        r.cuisine.toLowerCase().includes(text) ||
        (Array.isArray(r.menu) && r.menu.some(m => m.name.toLowerCase().includes(text)))
      ) &&
      (!cuisine || r.cuisine === cuisine) &&
      (!rating || r.rating >= parseFloat(rating))
    );
  });

  const isFiltered = !!search || cuisine || rating;

  return (
    <section 
      className={layout.generateSeedClass('restaurants-section')}
      {...layout.getElementAttributes('restaurants-section', 0)}
    >
      <div 
        className={`flex flex-col md:flex-row gap-4 mb-8 items-center ${layout.searchBar.containerClass}`}
        {...layout.getElementAttributes('search-filters', 0)}
      >
        <Input
          type="text"
          placeholder="Search by name, cuisine, or menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`max-w-xs ${layout.searchBar.inputClass}`}
          {...layout.getElementAttributes('search-input', 0)}
        />
        <Select value={cuisine || "all"} onValueChange={v => setCuisine(v === "all" ? "" : v)}>
          <SelectTrigger 
            className={`w-40 ${layout.generateSeedClass('cuisine-select')}`}
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
            className={`w-32 ${layout.generateSeedClass('rating-select')}`}
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
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            className={`ml-3 mt-2 md:mt-0 ${layout.generateSeedClass('reset-filters-btn')}`}
            onClick={() => {
              setSearch("");
              setCuisine("");
              setRating("");
            }}
            {...layout.getElementAttributes('reset-filters-btn', 0)}
          >
            Reset filters
          </Button>
        )}
      </div>
      <div 
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 ${layout.grid.containerClass}`}
        {...layout.getElementAttributes('restaurants-grid', 0)}
      >
        {filtered.length > 0 ? (
          filtered.map((r, index) => (
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
    </section>
  );
}
