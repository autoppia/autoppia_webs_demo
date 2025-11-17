import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

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

const resolveSeed = (v2SeedValue: number | null | undefined, dbMode: boolean): number => {
  if (!dbMode) {
    return 1;
  }
  if (typeof v2SeedValue === "number" && Number.isFinite(v2SeedValue)) {
    return clampSeed(v2SeedValue);
  }
  throw new Error("[autolist] v2 is enabled but no valid v2-seed was provided");
};

export async function loadTasks(
  v2Seed?: number | null,
  limit: number = 80
): Promise<RemoteTask[]> {
  const dbMode = isDbLoadModeEnabled();
  const effectiveSeed = resolveSeed(v2Seed, dbMode);

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
      return tasks;
    }

    throw new Error(
      `[autolist] No tasks returned from dataset (seed=${effectiveSeed})`
    );
  } catch (error) {
    console.error("[autolist] Failed to load tasks from dataset:", error);
    throw error;
  }
}
