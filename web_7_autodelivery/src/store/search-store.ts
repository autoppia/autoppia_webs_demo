// src/store/search-store.ts
import { create } from 'zustand';

type SearchStore = {
  search: string;
  setSearch: (value: string) => void;
  cuisine: string;
  setCuisine: (value: string) => void;
  rating: string;
  setRating: (value: string) => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  search: '',
  setSearch: (value) => set({ search: value }),
  cuisine: '',
  setCuisine: (value) => set({ cuisine: value }),
  rating: '',
  setRating: (value) => set({ rating: value }),
}));