import type { Book } from "@/data/books";
import { initializeBooks } from "@/data/books";
import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";
import { clampBaseSeed } from "@/shared/seed-resolver";

export interface BookSearchFilters {
  genre?: string;
  year?: number;
}

const BASE_SEED_STORAGE_KEY = "autobooks_seed_base";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private books: Book[] = [];
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;

  private constructor() {
    this.isEnabled = isDynamicEnabled();
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadBooks();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getBaseSeed(): number {
    if (typeof window === "undefined") {
      return clampBaseSeed(1);
    }
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("seed");
      if (raw) {
        const parsed = clampBaseSeed(Number.parseInt(raw, 10));
        window.localStorage.setItem(BASE_SEED_STORAGE_KEY, parsed.toString());
        return parsed;
      }
      const stored = window.localStorage.getItem(BASE_SEED_STORAGE_KEY);
      if (stored) {
        return clampBaseSeed(Number.parseInt(stored, 10));
      }
    } catch (error) {
      console.warn("[autobooks] Failed to resolve base seed from URL/localStorage", error);
    }
    return clampBaseSeed(1);
  }

  private async loadBooks(): Promise<void> {
    try {
      this.getBaseSeed();
      this.books = await initializeBooks();
    } catch (error) {
      console.error("[autobooks] Failed to initialize books", error);
      throw error;
    } finally {
      this.ready = true;
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getBooks(): Book[] {
    return this.books;
  }

  public getBookById(id: string): Book | undefined {
    return this.books.find((book) => book.id === id);
  }

  public getFeaturedBooks(count = 6): Book[] {
    return this.books.slice(0, count);
  }

  public findRelatedBooks(bookId: string, limit = 4): Book[] {
    const current = this.getBookById(bookId);
    const pool = this.books.filter((book) => book.id !== bookId);

    if (current && current.genres.length > 0) {
      const primaryGenre = current.genres[0];
      const sameGenre = pool.filter((book) => book.genres.includes(primaryGenre));
      if (sameGenre.length >= limit) {
        return sameGenre.slice(0, limit);
      }
    }

    return pool.slice(0, limit);
  }

  public searchBooks(query: string, filters?: BookSearchFilters): Book[] {
    const normalizedQuery = query.trim().toLowerCase();
    return this.books.filter((book) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.synopsis.toLowerCase().includes(normalizedQuery) ||
        book.director.toLowerCase().includes(normalizedQuery) ||
        book.cast.some((actor) => actor.toLowerCase().includes(normalizedQuery));

      const matchesGenre = !filters?.genre || book.genres.includes(filters.genre);
      const matchesYear = !filters?.year || book.year === filters.year;

      return matchesQuery && matchesGenre && matchesYear;
    });
  }

  public getBooksByGenre(genre: string): Book[] {
    return this.books.filter((book) => book.genres.includes(genre));
  }

  public getAvailableGenres(): string[] {
    const genres = new Set<string>();
    for (const book of this.books) {
      for (const genre of book.genres) {
        if (genre) genres.add(genre);
      }
    }
    return Array.from(genres).sort((a, b) => a.localeCompare(b));
  }

  public getAvailableYears(): number[] {
    const years = new Set<number>();
    for (const book of this.books) {
      if (book.year) {
        years.add(book.year);
      }
    }
    return Array.from(years).sort((a, b) => b - a);
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  public getLayoutConfig(seed?: number) {
    return getEffectiveLayoutConfig(seed);
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const getBooks = () => dynamicDataProvider.getBooks();
export const getBookById = (id: string) => dynamicDataProvider.getBookById(id);
export const getFeaturedBooks = (count?: number) => dynamicDataProvider.getFeaturedBooks(count);
export const getRelatedBooks = (bookId: string, limit?: number) => dynamicDataProvider.findRelatedBooks(bookId, limit);
export const searchBooks = (query: string, filters?: BookSearchFilters) => dynamicDataProvider.searchBooks(query, filters);
export const getBooksByGenre = (genre: string) => dynamicDataProvider.getBooksByGenre(genre);
export const getAvailableGenres = () => dynamicDataProvider.getAvailableGenres();
export const getAvailableYears = () => dynamicDataProvider.getAvailableYears();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);
