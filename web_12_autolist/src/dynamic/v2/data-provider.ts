import type { RemoteTask } from "@/data/tasks-enhanced";
import { initializeTasks } from "@/data/tasks-enhanced";
import { clampBaseSeed, resolveSeedsSync } from "@/shared/seed-resolver";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

type AutolistWindow = Window & {
  __autolistV2Seed?: number | null;
};

export interface TaskSearchFilters {
  query?: string;
  priority?: number;
  completed?: boolean;
}

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private tasks: RemoteTask[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady: () => void = () => {};
  private currentSeed: number | null = null;
  private loadingPromise: Promise<void> | null = null;
  
  // Subscribers
  private taskSubscribers: Array<(data: RemoteTask[]) => void> = [];

  private constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.initialize();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private getBaseSeedFromUrl(): number | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get("seed");
    if (seedParam) {
      const parsed = Number.parseInt(seedParam, 10);
      if (Number.isFinite(parsed)) {
        return clampBaseSeed(parsed);
      }
    }
    return null;
  }

  private getRuntimeV2Seed(): number | null {
    if (typeof window === "undefined") return null;
    const value = (window as AutolistWindow).__autolistV2Seed;
    if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
      return value;
    }
    return null;
  }

  private async initialize(): Promise<void> {
    // Reset ready state when initializing
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    
    const baseSeed = this.getBaseSeedFromUrl();
    const runtimeSeed = this.getRuntimeV2Seed();
    
    // Resolve V2 seed from base seed
    let v2Seed: number | null = null;
    if (baseSeed !== null) {
      const resolvedSeeds = resolveSeedsSync(baseSeed);
      v2Seed = resolvedSeeds.v2;
    }
    if (v2Seed === null) {
      v2Seed = runtimeSeed;
    }
    if (v2Seed === null) {
      v2Seed = 1;
    }
    
    this.currentSeed = v2Seed;
    
    try {
      console.log("[autolist/data-provider] Initializing data - baseSeed:", baseSeed, "v2Seed:", v2Seed);
      
      // Initialize tasks
      const tasks = await initializeTasks(v2Seed);
      
      this.setTasks(tasks);
      
      console.log("[autolist/data-provider] ✅ Data initialized:", {
        tasks: tasks.length,
      });
    } catch (error) {
      console.error("[autolist/data-provider] Failed to initialize data:", error);
      // Mark as ready even on error to prevent infinite loading
      this.ready = true;
      this.resolveReady();
    }
    
    // Listen for seed changes
    if (typeof window !== "undefined") {
      window.addEventListener("autolist:v2SeedChange", this.handleSeedEvent.bind(this));
    }
  }

  private handleSeedEvent = () => {
    console.log("[autolist/data-provider] Seed change event received");
    this.reload();
  };

  /**
   * Reload data if seed has changed
   */
  public reloadIfSeedChanged(seed?: number | null): void {
    const runtimeSeed = this.getRuntimeV2Seed();
    const seedToUse = seed !== undefined && seed !== null ? seed : runtimeSeed;
    if (seedToUse !== null && seedToUse !== this.currentSeed) {
      console.log(`[autolist] Seed changed from ${this.currentSeed} to ${seedToUse}, reloading...`);
      this.reload(seedToUse);
    }
  }

  /**
   * Reload all data with a new seed
   */
  public async reload(seedValue?: number | null): Promise<void> {
    // Prevent concurrent reloads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = (async () => {
      try {
        const baseSeed = this.getBaseSeedFromUrl();
        const runtimeSeed = this.getRuntimeV2Seed();
        
        let v2Seed: number | null = null;
        if (seedValue !== undefined && seedValue !== null) {
          v2Seed = seedValue;
        } else if (baseSeed !== null) {
          const resolvedSeeds = resolveSeedsSync(baseSeed);
          v2Seed = resolvedSeeds.v2;
        }
        if (v2Seed === null) {
          v2Seed = runtimeSeed;
        }
        if (v2Seed === null) {
          v2Seed = 1;
        }
        
        // If base seed = 1, use fallback data directly
        if (baseSeed === 1) {
          console.log("[autolist/data-provider] Reload: Base seed is 1, using fallback data");
          this.currentSeed = 1;
        } else {
          this.currentSeed = v2Seed;
        }
        
        // Reset ready state
        this.ready = false;
        this.readyPromise = new Promise<void>((resolve) => {
          this.resolveReady = resolve;
        });
        
        // CRITICAL: Clear all existing data BEFORE loading new data
        // This ensures no old seed data is preserved
        console.log("[autolist/data-provider] Clearing old data before loading new seed data...");
        this.tasks = [];
        
        // Notify all subscribers with empty arrays to clear UI immediately
        this.notifyTasks();
        
        // Small delay to ensure subscribers have processed the clear
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Now load new data for the new seed
        const tasks = await initializeTasks(v2Seed);
        
        // Set new data (this will notify subscribers again with new data)
        this.setTasks(tasks);
        
        console.log("[autolist/data-provider] ✅ Data reloaded for seed", v2Seed, ":", {
          tasks: tasks.length,
        });
      } catch (error) {
        console.error("[autolist] Failed to reload data:", error);
        // Mark as ready even on error to prevent infinite loading
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    
    return this.loadingPromise;
  }

  private setTasks(nextTasks: RemoteTask[]): void {
    console.log("[autolist/data-provider] setTasks called with", nextTasks.length, "tasks");
    this.tasks = nextTasks;
    this.notifyTasks();
    this.checkAndResolveReady();
  }

  private checkAndResolveReady(): void {
    // Mark as ready when data is loaded
    if (!this.ready && this.tasks.length > 0) {
      this.ready = true;
      console.log("[autolist/data-provider] Marking as ready");
      this.resolveReady();
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public getTasks(): RemoteTask[] {
    return this.tasks;
  }

  public getTaskById(id: string): RemoteTask | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  public searchTasks(query: string, filters?: TaskSearchFilters): RemoteTask[] {
    const normalized = query.trim().toLowerCase();
    let results = this.tasks;
    
    if (normalized) {
      results = results.filter(
        (task) =>
          task.name?.toLowerCase().includes(normalized) ||
          task.description?.toLowerCase().includes(normalized)
      );
    }
    
    if (filters?.priority !== undefined) {
      results = results.filter((task) => task.priority === filters.priority);
    }
    
    if (filters?.completed !== undefined) {
      if (filters.completed) {
        results = results.filter((task) => task.completed_at !== null);
      } else {
        results = results.filter((task) => task.completed_at === null);
      }
    }
    
    return results;
  }

  public getTasksByPriority(priority: number): RemoteTask[] {
    return this.tasks.filter((task) => task.priority === priority);
  }

  public getCompletedTasks(): RemoteTask[] {
    return this.tasks.filter((task) => task.completed_at !== null);
  }

  public getActiveTasks(): RemoteTask[] {
    return this.tasks.filter((task) => task.completed_at === null);
  }

  public subscribeTasks(callback: (data: RemoteTask[]) => void): () => void {
    this.taskSubscribers.push(callback);
    callback(this.tasks);
    return () => {
      this.taskSubscribers = this.taskSubscribers.filter((cb) => cb !== callback);
    };
  }

  private notifyTasks(): void {
    this.taskSubscribers.forEach((cb) => cb(this.tasks));
  }

  public isDynamicModeEnabled(): boolean {
    return isDbLoadModeEnabled();
  }

  public getLayoutConfig(seed?: number) {
    return { seed: clampBaseSeed(seed ?? 1) };
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const whenReady = () => dynamicDataProvider.whenReady();
export const getTasks = () => dynamicDataProvider.getTasks();
export const getTaskById = (id: string) => dynamicDataProvider.getTaskById(id);
export const searchTasks = (query: string, filters?: TaskSearchFilters) => dynamicDataProvider.searchTasks(query, filters);
export const getTasksByPriority = (priority: number) => dynamicDataProvider.getTasksByPriority(priority);
export const getCompletedTasks = () => dynamicDataProvider.getCompletedTasks();
export const getActiveTasks = () => dynamicDataProvider.getActiveTasks();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
