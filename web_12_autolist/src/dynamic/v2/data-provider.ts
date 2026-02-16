import type { RemoteTask } from "@/data/tasks-enhanced";
import { initializeTasks } from "@/data/tasks-enhanced";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

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

  private getSeed(): number {
    // V2 rule: if V2 is disabled, always act as seed=1.
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return getSeedFromUrl();
  }

  private async initialize(): Promise<void> {
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    try {
      const effectiveSeed = this.getSeed();
      this.currentSeed = effectiveSeed;
      const tasks = await initializeTasks(effectiveSeed);
      this.setTasks(tasks);
    } catch (error) {
      console.error("[autolist/data-provider] Failed to initialize data:", error);
      this.ready = true;
      this.resolveReady();
    }
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (this.loadingPromise) return this.loadingPromise;
    const targetSeed = clampSeed(seedValue ?? this.getSeed());
    if (targetSeed === this.currentSeed && this.ready) return;
    this.currentSeed = targetSeed;
    this.ready = false;
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    this.loadingPromise = (async () => {
      try {
        // Clear current data so UI doesn't show stale seed data.
        this.tasks = [];
        this.notifyTasks();
        const tasks = await initializeTasks(targetSeed);
        this.setTasks(tasks);
      } catch (error) {
        console.error("[autolist] Failed to reload data:", error);
        this.ready = true;
        this.resolveReady();
      } finally {
        this.loadingPromise = null;
      }
    })();
    return this.loadingPromise;
  }

  public reloadIfSeedChanged(seed?: number | null): void {
    const targetSeed = seed !== undefined && seed !== null ? seed : this.getSeed();
    if (targetSeed !== this.currentSeed) {
      this.reload(targetSeed);
    }
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
    return isV2Enabled();
  }

  public getLayoutConfig(seed?: number) {
    return { seed: clampSeed(seed ?? 1) };
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
