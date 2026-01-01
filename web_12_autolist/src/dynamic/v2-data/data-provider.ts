import tasksJson from "@/data/original/tasks_1.json";
import { clampBaseSeed } from "@/shared/seed-resolver";

type TaskRecord = typeof tasksJson extends Array<infer T> ? T : never;

export interface TaskFilters {
  query?: string;
  priority?: number;
}

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private tasks: TaskRecord[] = [];
  private readyPromise: Promise<void>;
  private ready = false;
  private isEnabled = false;

  private constructor() {
    this.readyPromise = this.loadTasks();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async loadTasks(): Promise<void> {
    try {
      this.tasks = Array.isArray(tasksJson) ? tasksJson : [];
      this.isEnabled = this.tasks.length > 0;
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

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  public getTasks(limit?: number): TaskRecord[] {
    const items = [...this.tasks];
    if (limit && Number.isFinite(limit)) {
      return items.slice(0, limit);
    }
    return items;
  }

  public getTaskById(id: string): TaskRecord | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  public searchTasks(filters?: TaskFilters): TaskRecord[] {
    if (!filters) return this.tasks;
    const { query, priority } = filters;
    const normalizedQuery = query?.trim().toLowerCase() || "";

    return this.tasks.filter((task) => {
      const matchesPriority = priority ? task.priority === priority : true;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        task.name?.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery);
      return matchesPriority && matchesQuery;
    });
  }

  public getFeaturedTasks(count = 6, seed = 1): TaskRecord[] {
    const safeSeed = clampBaseSeed(seed);
    const startIndex = safeSeed % Math.max(this.tasks.length, 1);
    const rotated = [...this.tasks.slice(startIndex), ...this.tasks.slice(0, startIndex)];
    return rotated.slice(0, count);
  }
}

const dynamicDataProvider = DynamicDataProvider.getInstance();

export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getTasks = (limit?: number) => dynamicDataProvider.getTasks(limit);
export const searchTasks = (filters?: TaskFilters) => dynamicDataProvider.searchTasks(filters);
export const getTaskById = (id: string) => dynamicDataProvider.getTaskById(id);
export const getFeaturedTasks = (count?: number, seed?: number) =>
  dynamicDataProvider.getFeaturedTasks(count, seed ?? 1);
