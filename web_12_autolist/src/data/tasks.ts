import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

export interface RemoteTask {
  id?: string;
  name?: string;
  description?: string;
  due_date?: string | null;
  priority?: number;
  completed_at?: string | null;
}

export interface LoadTasksResult {
  tasks: RemoteTask[];
  error?: string;
}

export async function loadTasks(
  v2Seed?: number | null,
  limit: number = 80
): Promise<LoadTasksResult> {
  const effectiveSeed = isV2Enabled()
    ? clampSeed(v2Seed ?? getSeedFromUrl())
    : 1;

  // Always call the server endpoint - server determines whether v2 is enabled or disabled
  // When v2 is disabled, the server returns the original dataset
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
        `[autolist] Loaded ${tasks.length} tasks from server (seed=${effectiveSeed})`
      );
      return { tasks };
    }

    // If server returns empty array, throw error (no fallback)
    throw new Error(`Server returned empty array for seed ${effectiveSeed}`);
  } catch (error) {
    console.error("[autolist] Failed to load tasks from server:", error);
    // Re-throw error - server is the single source of truth
    throw error;
  }
}
