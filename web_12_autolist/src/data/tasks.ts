import { fetchSeededSelection } from "@/shared/seeded-loader";

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
