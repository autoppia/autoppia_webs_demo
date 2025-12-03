import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import tasksData from "./original/tasks_1.json";

type AutolistWindow = Window & {
  __autolistV2Seed?: number | null;
};

export interface RemoteTask {
  id?: string;
  name?: string;
  description?: string;
  due_date?: string | null;
  priority?: number;
  completed_at?: string | null;
}

/**
 * Load tasks from local JSON file (fallback when v2 is disabled or backend unavailable)
 */
async function loadTasksFromLocal(limit: number = 80): Promise<RemoteTask[]> {
  try {
    // Transform local JSON format to RemoteTask format
    const localTasks = (tasksData as any[]).slice(0, limit).map((task: any) => ({
      id: task.id?.toString(),
      name: task.name,
      description: task.description,
      due_date: task.dueDate || task.createdAt || null,
      priority: task.priority || 4,
      completed_at: task.status === "completed" 
        ? (task.createdAt || new Date().toISOString()) 
        : null,
    }));
    
    console.log(`[autolist] Loaded ${localTasks.length} tasks from local JSON file`);
    return localTasks;
  } catch (error) {
    console.error("[autolist] Failed to load tasks from local JSON:", error);
    return [];
  }
}

const clampSeed = (value: number, fallback: number = 1): number =>
  value >= 1 && value <= 300 ? value : fallback;

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as AutolistWindow).__autolistV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

export interface LoadTasksResult {
  tasks: RemoteTask[];
  error?: string;
}

export async function loadTasks(
  v2Seed?: number | null,
  limit: number = 80
): Promise<LoadTasksResult> {
  const dbMode = isDbLoadModeEnabled();
  
  // If v2 DB mode is disabled, always load from local JSON
  if (!dbMode) {
    console.log("[autolist] v2 DB mode disabled, loading from local JSON");
    const localTasks = await loadTasksFromLocal(limit);
    return { tasks: localTasks };
  }

  // If v2 is enabled, try to load from backend
  let effectiveSeed = 1;
  if (typeof window === "undefined") {
    effectiveSeed = 1;
  } else {
    // Wait a bit for SeedContext to sync v2Seed to window
    await new Promise(resolve => setTimeout(resolve, 100));
    const resolvedSeed = typeof v2Seed === "number" ? clampSeed(v2Seed, 1) : getRuntimeV2Seed();
    // Default to 1 if no v2-seed provided
    effectiveSeed = resolvedSeed ?? 1;
  }

  try {
    const tasks = await fetchSeededSelection<RemoteTask>({
      projectKey: "web_12_autolist",
      entityType: "tasks",
      seedValue: effectiveSeed,
      limit,
      method: "shuffle",
    });

    if (Array.isArray(tasks) && tasks.length > 0) {
      console.log(
        `[autolist] Loaded ${tasks.length} tasks from dataset (seed=${effectiveSeed})`
      );
      return { tasks };
    }

    // If no tasks returned from backend, fallback to local JSON (no error, just fallback)
    console.warn(`[autolist] No tasks returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    const localTasks = await loadTasksFromLocal(limit);
    return { tasks: localTasks }; // No error message for fallback
  } catch (error) {
    // If backend fails, fallback to local JSON (no error, just fallback)
    console.warn("[autolist] Backend unavailable, falling back to local JSON:", error);
    const localTasks = await loadTasksFromLocal(limit);
    return { tasks: localTasks }; // No error message for fallback
  }
}
