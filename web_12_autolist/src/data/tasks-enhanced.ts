import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { clampBaseSeed, getSeedForLoad } from "@/shared/seed-resolver";
import tasksData from "./original/tasks_1.json";

const PROJECT_KEY = "web_12_autolist";
const ENTITY_TYPE = "tasks";

export interface RemoteTask {
  id?: string;
  name?: string;
  description?: string;
  due_date?: string | null;
  priority?: number;
  completed_at?: string | null;
}

interface LocalTaskData {
  id?: string | number;
  name?: string;
  description?: string;
  priority?: number;
  status?: string;
  createdAt?: string;
  dueDate?: string;
  tags?: string[];
}

const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) return clampBaseSeed(parsed);
  }
  return null;
};

/**
 * Load tasks from local JSON file (fallback when v2 is disabled or backend unavailable)
 */
async function loadTasksFromLocal(limit: number = 80): Promise<RemoteTask[]> {
  try {
    // Transform local JSON format to RemoteTask format
    const localTasks = ((tasksData as LocalTaskData[]).slice(0, limit).map((task: LocalTaskData) => ({
      id: task.id?.toString(),
      name: task.name,
      description: task.description,
      due_date: task.dueDate || task.createdAt || null,
      priority: task.priority || 4,
      completed_at: task.status === "completed" 
        ? (task.createdAt || new Date().toISOString()) 
        : null,
    })));
    
    return localTasks;
  } catch (error) {
    console.error("[autolist] Failed to load tasks from local JSON:", error);
    return [];
  }
}

export async function initializeTasks(v2SeedValue?: number | null, limit = 80): Promise<RemoteTask[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autolist] Base seed is 1, using original data (skipping DB mode)");
    return await loadTasksFromLocal(limit);
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = getSeedForLoad(v2SeedValue ?? getBaseSeedFromUrl() ?? 1);

    try {
      const tasks = await fetchSeededSelection<RemoteTask>({
        projectKey: PROJECT_KEY,
        entityType: ENTITY_TYPE,
        seedValue: effectiveSeed,
        limit: 50, // Fixed limit of 50 items for DB mode
        method: "shuffle",
      });

      if (Array.isArray(tasks) && tasks.length > 0) {
        console.log(
          `[autolist] Loaded ${tasks.length} tasks from dataset (seed=${effectiveSeed})`
        );
        return tasks;
      }

      // If no tasks returned from backend, fallback to local JSON
      console.warn(`[autolist] No tasks returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      // If backend fails, fallback to local JSON
      console.warn("[autolist] Backend unavailable, falling back to local JSON:", error);
    }
  }

  // Fallback to local JSON
  return await loadTasksFromLocal(limit);
}
