import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { fetchSeededSelection } from "@/shared/seeded-loader";
import { isV2Enabled } from "@/dynamic/shared/flags";

export interface RemoteTask {
  id?: string;
  name?: string;
  description?: string;
  due_date?: string | null;
  priority?: number;
  completed_at?: string | null;
}

let tasksCache: RemoteTask[] = [];

/**
 * Initialize tasks from server endpoint.
 * Server determines whether v2 is enabled or disabled.
 * When v2 is disabled, the server returns the original dataset.
 */
export async function initializeTasks(seedOverride?: number | null, limit = 50): Promise<RemoteTask[]> {
  const seed = isV2Enabled()
    ? clampSeed(seedOverride ?? getSeedFromUrl())
    : 1;

  // Always call the server endpoint - server is the single source of truth
  try {
    console.log("[tasks-enhanced] Fetching tasks from server with seed:", seed);
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
    }

    // If server returns empty array, throw error (no fallback)
    throw new Error(`Server returned empty array for seed ${seed}`);
  } catch (error) {
    console.error("[tasks-enhanced] Failed to fetch from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
