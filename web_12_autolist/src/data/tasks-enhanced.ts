import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { getApiBaseUrl } from "@/shared/seeded-loader";
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

const clampSeed = (value: number, fallback = 1): number => {
  if (Number.isNaN(value)) return fallback;
  if (value < 1) return fallback;
  if (value > 300) return fallback;
  return value;
};

const getBaseSeedFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const seedParam = params.get("seed");
  if (seedParam) {
    const parsed = Number.parseInt(seedParam, 10);
    if (Number.isFinite(parsed)) {
      return clampBaseSeed(parsed);
    }
  }
  return null;
};

const resolveSeed = (dbModeEnabled: boolean, seedValue?: number | null): number => {
  if (!dbModeEnabled) {
    return 1;
  }
  
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampSeed(seedValue);
  }
  
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    const resolvedSeeds = resolveSeedsSync(baseSeed);
    if (resolvedSeeds.v2 !== null) {
      return resolvedSeeds.v2;
    }
    return clampSeed(baseSeed);
  }
  
  return 1;
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

/**
 * Fetch AI generated tasks from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedTasks(count: number): Promise<RemoteTask[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_key: PROJECT_KEY,
        entity_type: ENTITY_TYPE,
        count: 50, // Fixed count of 50
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI generation request failed: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    const result = await response.json();
    const generatedData = result?.generated_data ?? [];
    
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      throw new Error("No data returned from AI generation endpoint");
    }

    return generatedData as RemoteTask[];
  } catch (error) {
    console.error("[autolist] AI generation failed:", error);
    throw error;
  }
}

export async function initializeTasks(v2SeedValue?: number | null, limit = 80): Promise<RemoteTask[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  // Check base seed from URL - if seed = 1, use original data for both DB and AI modes
  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autolist] Base seed is 1, using original data (skipping DB/AI modes)");
    return await loadTasksFromLocal(limit);
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    // If no seed provided, wait a bit for SeedContext to sync v2Seed to window
    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);

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
  // Priority 2: AI generation mode - generate data via /datasets/generate-smart endpoint
  else if (aiGenerateEnabled) {
    try {
      console.log("[autolist] AI generation mode enabled, generating tasks...");
      const generatedTasks = await fetchAiGeneratedTasks(limit);
      
      if (Array.isArray(generatedTasks) && generatedTasks.length > 0) {
        console.log(`[autolist] Generated ${generatedTasks.length} tasks via AI`);
        return generatedTasks;
      }
      
      console.warn("[autolist] No tasks generated, falling back to local JSON");
    } catch (error) {
      // If AI generation fails, fallback to local JSON
      console.warn("[autolist] AI generation failed, falling back to local JSON:", error);
    }
  }
  // Priority 3: Fallback - use original local JSON data
  else {
    console.log("[autolist] V2 modes disabled, loading from local JSON");
  }

  // Fallback to local JSON
  return await loadTasksFromLocal(limit);
}
