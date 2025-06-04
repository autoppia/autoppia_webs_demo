import { create } from 'zustand';

interface SearchStore {
  search: string;
  setSearch: (val: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  search: '',
  setSearch: (val) => set({ search: val }),
}));
