"use client";
import { restaurants } from '@/data/restaurants';
import RestaurantCard from './RestaurantCard';
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchStore } from '@/store/search-store';

const cuisineOptions = Array.from(new Set(restaurants.map(r => r.cuisine)));
const ratingOptions = [4, 4.5, 5];

export default function RestaurantsListPage() {
  const search = useSearchStore(s => s.search);
  const setSearch = useSearchStore(s => s.setSearch);
  const cuisine = useSearchStore(s => s.cuisine);
  const setCuisine = useSearchStore(s => s.setCuisine);
  const rating = useSearchStore(s => s.rating);
  const setRating = useSearchStore(s => s.setRating);

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
    <section>
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <Input
          type="text"
          placeholder="Search by name, cuisine, or menu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={cuisine} onValueChange={v => setCuisine(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All cuisines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="" value="">All cuisines</SelectItem>
            {cuisineOptions.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={rating} onValueChange={v => setRating(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="" value="">All ratings</SelectItem>
            {ratingOptions.map(opt => (
              <SelectItem key={opt} value={opt.toString()}>{opt}+</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            className="ml-3 mt-2 md:mt-0"
            onClick={() => {
              setSearch("");
              setCuisine("");
              setRating("");
            }}
          >
            Reset filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filtered.length > 0 ? (
          filtered.map(r => (
            <RestaurantCard
              key={r.id}
              id={r.id}
              name={r.name}
              image={r.image}
              cuisine={r.cuisine}
              rating={r.rating}
              description={r.description}
            />
          ))
        ) : (
          <div className="text-zinc-400 text-center col-span-full py-16 text-lg">No restaurants found.</div>
        )}
      </div>
    </section>
  );
}
