import type { Movie } from "@/data/movies";
import { initializeMovies } from "@/data/movies";
import { clampBaseSeed } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

export interface MovieSearchFilters {
  genre?: string;
  year?: number;
}

const BASE_SEED_STORAGE_KEY = "autocinema_seed_base";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private movies: Movie[] = [];
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;
  private currentSeed: number = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.isEnabled = isV2Enabled();
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadMovies();

    window.addEventListener("autocinema:v2SeedChange", (event) => {
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
      console.warn("[autocinema] Failed to resolve base seed from URL/localStorage", error);
    }
    return clampBaseSeed(1);
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as any).__autocinemaV2Seed;
    if (typeof value === "number" && Number.isFinite(value)) {
      return clampBaseSeed(value);
    }
    return null;
  }

  private async loadMovies(): Promise<void> {
    try {
      const baseSeed = this.getBaseSeed();
      const v2Seed = this.getRuntimeV2Seed();
      const effectiveSeed = clampBaseSeed(v2Seed ?? baseSeed);
      this.currentSeed = effectiveSeed;
      this.movies = await initializeMovies(effectiveSeed);
    } catch (error) {
      console.error("[autocinema] Failed to initialize movies", error);
      throw error;
    } finally {
      this.ready = true;
    }
  }

  private async reloadIfSeedChanged(): Promise<void> {
    const newSeed = this.getBaseSeed();
    if (newSeed !== this.currentSeed) {
      console.log(`[autocinema] Seed changed from ${this.currentSeed} to ${newSeed}, reloading movies...`);
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
          this.movies = await initializeMovies();
          this.ready = true;
        } catch (error) {
          console.error("[autocinema] Failed to reload movies", error);
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
    const runtimeSeed = seedValue !== undefined && seedValue !== null 
      ? seedValue
      : this.getRuntimeV2Seed();
    const targetSeed = runtimeSeed !== null ? clampBaseSeed(runtimeSeed) : this.getBaseSeed();
    
    if (targetSeed === this.currentSeed && this.ready) {
      return; // Already loaded with this seed
    }
    
    console.log(`[autocinema] Reloading movies for base seed=${targetSeed}...`);
    this.currentSeed = targetSeed;
    this.ready = false;
    
    // If already loading, wait for it
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }
    
    // Start new load (initializeMovies will derive the V2 seed from the URL)
    this.loadingPromise = (async () => {
      try {
        this.movies = await initializeMovies();
        this.ready = true;
        console.log(`[autocinema] Movies reloaded: ${this.movies.length} movies`);
      } catch (error) {
        console.error("[autocinema] Failed to reload movies", error);
        this.ready = true; // Mark as ready even on error to prevent blocking
      } finally {
        this.loadingPromise = null;
      }
    })();
    
    await this.loadingPromise;
  }

  public getMovies(): Movie[] {
    return this.movies;
  }

  public getMovieById(id: string): Movie | undefined {
    return this.movies.find((movie) => movie.id === id);
  }

  public getFeaturedMovies(count = 6): Movie[] {
    return this.movies.slice(0, count);
  }

  public findRelatedMovies(movieId: string, limit = 4): Movie[] {
    const current = this.getMovieById(movieId);
    const pool = this.movies.filter((movie) => movie.id !== movieId);

    if (current && current.genres.length > 0) {
      const primaryGenre = current.genres[0];
      const sameGenre = pool.filter((movie) => movie.genres.includes(primaryGenre));
      if (sameGenre.length >= limit) {
        return sameGenre.slice(0, limit);
      }
    }

    return pool.slice(0, limit);
  }

  public searchMovies(query: string, filters?: MovieSearchFilters): Movie[] {
    const normalizedQuery = query.trim().toLowerCase();
    return this.movies.filter((movie) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        movie.title.toLowerCase().includes(normalizedQuery) ||
        movie.synopsis.toLowerCase().includes(normalizedQuery) ||
        movie.director.toLowerCase().includes(normalizedQuery) ||
        movie.cast.some((actor) => actor.toLowerCase().includes(normalizedQuery));

      const matchesGenre = !filters?.genre || movie.genres.includes(filters.genre);
      const matchesYear = !filters?.year || movie.year === filters.year;

      return matchesQuery && matchesGenre && matchesYear;
    });
  }

  public getMoviesByGenre(genre: string): Movie[] {
    return this.movies.filter((movie) => movie.genres.includes(genre));
  }

  public getAvailableGenres(): string[] {
    const genres = new Set<string>();
    this.movies.forEach((movie) => {
      movie.genres.forEach((genre) => {
        if (genre) genres.add(genre);
      });
    });
    return Array.from(genres).sort((a, b) => a.localeCompare(b));
  }

  public getAvailableYears(): number[] {
    const years = new Set<number>();
    this.movies.forEach((movie) => {
      if (movie.year) {
        years.add(movie.year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const getMovies = () => dynamicDataProvider.getMovies();
export const getMovieById = (id: string) => dynamicDataProvider.getMovieById(id);
export const getFeaturedMovies = (count?: number) => dynamicDataProvider.getFeaturedMovies(count);
export const getRelatedMovies = (movieId: string, limit?: number) => dynamicDataProvider.findRelatedMovies(movieId, limit);
export const searchMovies = (query: string, filters?: MovieSearchFilters) => dynamicDataProvider.searchMovies(query, filters);
export const getMoviesByGenre = (genre: string) => dynamicDataProvider.getMoviesByGenre(genre);
export const getAvailableGenres = () => dynamicDataProvider.getAvailableGenres();
export const getAvailableYears = () => dynamicDataProvider.getAvailableYears();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
