import { clampBaseSeed } from "@/shared/seed-resolver";
import tasksData from "./original/tasks_1.json";

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

function loadTasksFromLocal(limit: number = 80): RemoteTask[] {
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
 * Initialize tasks from base seed data (local JSON only).
 */
export async function initializeTasks(seedOverride?: number | null, limit = 80): Promise<RemoteTask[]> {
  const _seed = clampBaseSeed(seedOverride ?? 1);
  tasksCache = loadTasksFromLocal(limit);
  return tasksCache;
}
