"use client";

import type { User, Post, Job, Recommendation } from "@/library/dataset";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import fallbackUsers from "./original/users_1.json";
import fallbackPosts from "./original/posts_1.json";
import fallbackJobs from "./original/jobs_1.json";
import fallbackRecommendations from "./original/recommendations_1.json";

const PROJECT_KEY = "web_9_autoconnect";

const FALLBACK_MAP: Record<string, any[]> = {
  users: fallbackUsers as User[],
  posts: fallbackPosts as Post[],
  jobs: fallbackJobs as Job[],
  recommendations: fallbackRecommendations as Recommendation[],
};

type LoadOptions = {
  limit?: number;
  method?: "select" | "shuffle" | "filter" | "distribute";
  filterKey?: string;
  filterValues?: string[];
};

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autoconnectV2Seed;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 300) {
    return value;
  }
  return null;
};

function resolveSeed(entityType: string, v2SeedValue?: number | null): number {
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {
    dbModeEnabled = false;
  }

  if (dbModeEnabled) {
    // If v2 is enabled, use the v2-seed provided OR from window OR default to 1
    if (typeof v2SeedValue === "number" && v2SeedValue >= 1 && v2SeedValue <= 300) {
      return v2SeedValue;
    }
    // Try to get from window
    const fromWindow = getRuntimeV2Seed();
    if (fromWindow !== null) {
      return fromWindow;
    }
    // Default to 1 if no v2-seed provided
    return 1;
  }

  // If v2 is NOT enabled, automatically use seed=1
  return 1;
}

async function loadEntity<T>(
  entityType: string,
  options: LoadOptions,
  v2SeedValue?: number | null
): Promise<T[]> {
  // Check if v2 (DB mode) is enabled
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {
    dbModeEnabled = false;
  }

  // If V2 is NOT enabled, return original dataset immediately
  if (!dbModeEnabled) {
    const fallback = FALLBACK_MAP[entityType];
    if (fallback && fallback.length > 0) {
      console.log(`[autoconnect] DB mode disabled, using original dataset for ${entityType}`);
      return fallback as T[];
    }
    return [];
  }

  // Wait a bit for SeedContext to sync v2Seed to window if needed
  if (typeof window !== "undefined") {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const seed = resolveSeed(entityType, v2SeedValue);

  // Load from DB with the determined seed
  try {
    const payload = await fetchSeededSelection<T>({
      projectKey: PROJECT_KEY,
      entityType,
      seedValue: seed,
      limit: options.limit ?? 100,
      method: options.method ?? "shuffle",
      filterKey: options.filterKey,
      filterValues: options.filterValues,
    });

    if (payload && payload.length > 0) {
      console.log(`[autoconnect] Loaded ${payload.length} ${entityType} with seed=${seed}`);
      return payload;
    }

    console.warn(
      `[autoconnect] Empty dataset for ${entityType} (seed=${seed}). Falling back to original dataset.`
    );
  } catch (error) {
    console.error(
      `[autoconnect] Failed to load ${entityType} from dataset (seed=${seed}). Using original dataset fallback.`,
      error
    );
  }

  // Fallback to original dataset
  const fallback = FALLBACK_MAP[entityType];
  if (fallback && fallback.length > 0) {
    return fallback as T[];
  }

  return [];
}

export async function initializeUsers(v2SeedValue?: number | null): Promise<User[]> {
  return loadEntity<User>(
    "users",
    {
      limit: 80,
      method: "shuffle",
    },
    v2SeedValue
  );
}

export async function initializePosts(v2SeedValue?: number | null): Promise<Post[]> {
  return loadEntity<Post>(
    "posts",
    {
      limit: 60,
      method: "shuffle",
    },
    v2SeedValue
  );
}

export async function initializeJobs(v2SeedValue?: number | null): Promise<Job[]> {
  return loadEntity<Job>(
    "jobs",
    {
      limit: 60,
      method: "shuffle",
    },
    v2SeedValue
  );
}

export async function initializeRecommendations(
  v2SeedValue?: number | null
): Promise<Recommendation[]> {
  return loadEntity<Recommendation>(
    "recommendations",
    {
      limit: 50,
      method: "shuffle",
    },
    v2SeedValue
  );
}
