"use client";

import type { User, Post, Job, Recommendation } from "@/library/dataset";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";

const PROJECT_KEY = "web_9_autoconnect";

type LoadOptions = {
  limit?: number;
  method?: "select" | "shuffle" | "filter" | "distribute";
  filterKey?: string;
  filterValues?: string[];
};

function resolveSeed(entityType: string, v2SeedValue?: number | null): number {
  let dbModeEnabled = false;
  try {
    dbModeEnabled = isDbLoadModeEnabled();
  } catch {
    dbModeEnabled = false;
  }

  if (dbModeEnabled) {
    if (typeof v2SeedValue === "number" && v2SeedValue >= 1 && v2SeedValue <= 300) {
      return v2SeedValue;
    }
    throw new Error(`[autoconnect] v2 enabled but no valid v2-seed provided for ${entityType}`);
  }

  return 1;
}

async function loadEntity<T>(
  entityType: string,
  options: LoadOptions,
  v2SeedValue?: number | null
): Promise<T[]> {
  const seed = resolveSeed(entityType, v2SeedValue);
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

  throw new Error(`[autoconnect] No ${entityType} data returned from dataset (seed=${seed})`);
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
