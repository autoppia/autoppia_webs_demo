import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import tasksData from "./original/tasks_1.json";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

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

function loadTasksFromLocal(limit: number = 50): RemoteTask[] {
  const localTasks = (tasksData as LocalTaskData[]).slice(0, limit).map((task: LocalTaskData) => ({
    id: task.id?.toString(),
    name: task.name,
    description: task.description,
    due_date: task.dueDate || task.createdAt || null,
    priority: task.priority ?? 4,
    completed_at: task.status === "completed" ? (task.createdAt || new Date().toISOString()) : null,
  }));
  return localTasks;
}

let tasksCache: RemoteTask[] = [];

/**
 * Initialize tasks from server (when V2 is enabled) or local JSON (fallback).
 * When V2 is enabled, fetches from /datasets/load endpoint based on seed.
 */
export async function initializeTasks(seedOverride?: number | null, limit = 50): Promise<RemoteTask[]> {
  const seed = clampBaseSeed(seedOverride ?? getBaseSeedFromUrl());

  // If V2 is enabled, fetch from server endpoint
  if (isDbLoadModeEnabled()) {
    try {
      console.log("[tasks-enhanced] V2 enabled, fetching tasks from server with seed:", seed);
      const serverTasks = await fetchSeededSelection<RemoteTask>({
        projectKey: "web_12_autolist",
        entityType: "tasks",
        seedValue: seed,
        limit,
        method: "shuffle",
      });

      if (Array.isArray(serverTasks) && serverTasks.length > 0) {
        console.log("[tasks-enhanced] Loaded", serverTasks.length, "tasks from server");
        tasksCache = serverTasks;
        return tasksCache;
      } else {
        console.warn("[tasks-enhanced] Server returned empty array, falling back to local data");
      }
    } catch (error) {
      console.error("[tasks-enhanced] Failed to fetch from server, falling back to local data:", error);
      // Fall through to local fallback
    }
  }

  // Fallback to local JSON data (when V2 is disabled or server fetch failed)
  console.log("[tasks-enhanced] Using local fallback data");
  tasksCache = loadTasksFromLocal(limit);
  return tasksCache;
}
