import type { Book } from "@/data/books";
import { initializeBooks } from "@/data/books";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

export interface BookSearchFilters {
  genre?: string;
  year?: number;
}

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private books: Book[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadBooks();

    window.addEventListener("autobooks:v2SeedChange", (event) => {
      const detail = (event as CustomEvent<{ seed: number | null }>).detail;
      this.reload(detail?.seed ?? null);
    });
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getSeed(): number {
    // V2 rule: if V2 is disabled, always act as seed=1.
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return clampSeed(getSeedFromUrl());
  }

  private async loadBooks(): Promise<void> {
    try {
      const effectiveSeed = this.getSeed();
      this.currentSeed = effectiveSeed;
      this.books = await initializeBooks(effectiveSeed);
    } catch (error) {
      console.error("[autobooks] Failed to initialize books", error);
      throw error;
    } finally {
      this.ready = true;
    }
  }

  private async reloadIfSeedChanged(): Promise<void> {
    const newSeed = this.getSeed();
    if (newSeed !== this.currentSeed) {
      console.log(`[autobooks] Seed changed from ${this.currentSeed} to ${newSeed}, reloading books...`);
      this.currentSeed = newSeed;
      this.ready = false;

      // If already loading, wait for it
      if (this.loadingPromise) {
        await this.loadingPromise;
        return;
      }

      // Start new load
      this.loadingPromise = (async () => {
        try {
          this.books = await initializeBooks(newSeed);
          this.ready = true;
        } catch (error) {
          console.error("[autobooks] Failed to reload books", error);
          this.ready = true; // Mark as ready even on error to prevent blocking
        } finally {
          this.loadingPromise = null;
        }
      })();

      await this.loadingPromise;
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (typeof window === "undefined") return;

    const targetSeed = isV2Enabled()
      ? clampSeed(seedValue ?? this.getSeed())
      : 1;

    if (targetSeed === this.currentSeed && this.ready) {
      return; // Already loaded with this seed
    }

    console.log(`[autobooks] Reloading books for base seed=${targetSeed}...`);
    this.currentSeed = targetSeed;
    this.ready = false;

    // If already loading, wait for it
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    // Start new load with the current base seed
    this.loadingPromise = (async () => {
      try {
        this.books = await initializeBooks(targetSeed);
        this.ready = true;
        console.log(`[autobooks] Books reloaded: ${this.books.length} books`);
      } catch (error) {
        console.error("[autobooks] Failed to reload books", error);
        this.ready = true; // Mark as ready even on error to prevent blocking
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  public getBooks(): Book[] {
    // Trigger reload if seed changed
    if (typeof window !== "undefined") {
      this.reloadIfSeedChanged().catch((error) => {
        console.error("[autobooks] Failed to check/reload on seed change:", error);
      });
    }
    return this.books;
  }

  public getBookById(id: string): Book | undefined {
    if (!Array.isArray(this.books)) {
      return undefined;
    }
    return this.books.find((book) => book.id === id);
  }

  public getFeaturedBooks(count = 6): Book[] {
    if (!Array.isArray(this.books)) {
      return [];
    }
    return this.books.slice(0, count);
  }

  public findRelatedBooks(bookId: string, limit = 4): Book[] {
    if (!Array.isArray(this.books)) {
      return [];
    }
    const current = this.getBookById(bookId);
    const pool = this.books.filter((book) => book.id !== bookId);

    if (current && current.genres && current.genres.length > 0) {
      const primaryGenre = current.genres[0];
      const sameGenre = pool.filter((book) => book.genres && book.genres.includes(primaryGenre));
      if (sameGenre.length >= limit) {
        return sameGenre.slice(0, limit);
      }
    }

    return pool.slice(0, limit);
  }

  public searchBooks(query: string, filters?: BookSearchFilters): Book[] {
    if (!Array.isArray(this.books)) {
      return [];
    }
    const normalizedQuery = query.trim().toLowerCase();
    return this.books.filter((book) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.synopsis.toLowerCase().includes(normalizedQuery) ||
        book.director.toLowerCase().includes(normalizedQuery) ||
        (book.cast && book.cast.some((actor) => actor.toLowerCase().includes(normalizedQuery)));

      const matchesGenre = !filters?.genre || (book.genres && book.genres.includes(filters.genre));
      const matchesYear = !filters?.year || book.year === filters.year;

      return matchesQuery && matchesGenre && matchesYear;
    });
  }

  public getBooksByGenre(genre: string): Book[] {
    if (!Array.isArray(this.books)) {
      return [];
    }
    return this.books.filter((book) => book.genres && book.genres.includes(genre));
  }

  public getAvailableGenres(): string[] {
    if (!Array.isArray(this.books)) {
      return [];
    }
    const genres = new Set<string>();
    for (const book of this.books) {
      if (book.genres && Array.isArray(book.genres)) {
        for (const genre of book.genres) {
          if (genre) genres.add(genre);
        }
      }
    }
    return Array.from(genres).sort((a, b) => a.localeCompare(b));
  }

  public getAvailableYears(): number[] {
    if (!Array.isArray(this.books)) {
      return [];
    }
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
