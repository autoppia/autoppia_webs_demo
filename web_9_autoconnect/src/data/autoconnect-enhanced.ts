import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import type { User, Post, Job, Recommendation } from "@/library/dataset";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";

// Import fallback data - check if original directory exists
let fallbackUsers: User[] = [];
let fallbackPosts: Post[] = [];
let fallbackJobs: Job[] = [];
let fallbackRecommendations: Recommendation[] = [];

try {
  const usersData = require("./original/users_1.json");
  if (Array.isArray(usersData) && usersData.length > 0) {
    fallbackUsers = usersData as User[];
  }
} catch (e) {
  console.log("[autoconnect] Original users data not found");
}

try {
  const postsData = require("./original/posts_1.json");
  if (Array.isArray(postsData) && postsData.length > 0) {
    fallbackPosts = (postsData as Post[]).map((p) => ({ ...p, comments: p.comments || [] }));
  }
} catch (e) {
  console.log("[autoconnect] Original posts data not found");
}

try {
  const jobsData = require("./original/jobs_1.json");
  if (Array.isArray(jobsData) && jobsData.length > 0) {
    fallbackJobs = jobsData as Job[];
  }
} catch (e) {
  console.log("[autoconnect] Original jobs data not found");
}

try {
  const recommendationsData = require("./original/recommendations_1.json");
  if (Array.isArray(recommendationsData) && recommendationsData.length > 0) {
    fallbackRecommendations = recommendationsData as Recommendation[];
  }
} catch (e) {
  console.log("[autoconnect] Original recommendations data not found");
}

/**
 * Get base seed from URL
 */
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

const clampSeed = (seed: number): number => {
  if (Number.isNaN(seed)) return 1;
  if (seed < 1) return 1;
  if (seed > 300) return 300;
  return seed;
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
    // If base seed is 1, v2 should also be 1
    if (baseSeed === 1) {
      return 1;
    }

    // For other seeds, resolveSeedsSync returns defaults (v2: 1)
    // But we need the actual resolved seed, so use base seed directly
    // The backend will resolve it properly, and v2 seed is typically same as base seed
    return clampSeed(baseSeed);
  }

  return 1;
};

/**
 * Load users from DB
 */
async function loadUsersFromDb(seedValue?: number | null): Promise<User[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();

  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadUsersFromDb: seed=1, returning empty to force fallback");
    return [];
  }

  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autoconnect] loadUsersFromDb - effectiveSeed:", effectiveSeed);

  try {
    const users = await fetchSeededSelection<User>({
      projectKey: "web_9_autoconnect",
      entityType: "users",
      seedValue: effectiveSeed,
      limit: 50,
    });

    console.log("[autoconnect] loadUsersFromDb returned:", users.length, "users");
    return users;
  } catch (error) {
    console.error("[autoconnect] loadUsersFromDb error:", error);
    return [];
  }
}

/**
 * Load posts from DB
 */
async function loadPostsFromDb(seedValue?: number | null): Promise<Post[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();

  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadPostsFromDb: seed=1, returning empty to force fallback");
    return [];
  }

  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autoconnect] loadPostsFromDb - effectiveSeed:", effectiveSeed);

  try {
    const posts = await fetchSeededSelection<Post>({
      projectKey: "web_9_autoconnect",
      entityType: "posts",
      seedValue: effectiveSeed,
      limit: 50,
    });

    console.log("[autoconnect] loadPostsFromDb returned:", posts.length, "posts");
    return posts.map((p) => ({ ...p, comments: p.comments || [] }));
  } catch (error) {
    console.error("[autoconnect] loadPostsFromDb error:", error);
    return [];
  }
}

/**
 * Load jobs from DB
 */
async function loadJobsFromDb(seedValue?: number | null): Promise<Job[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();

  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadJobsFromDb: seed=1, returning empty to force fallback");
    return [];
  }

  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autoconnect] loadJobsFromDb - effectiveSeed:", effectiveSeed);

  try {
    const jobs = await fetchSeededSelection<Job>({
      projectKey: "web_9_autoconnect",
      entityType: "jobs",
      seedValue: effectiveSeed,
      limit: 50,
    });

    console.log("[autoconnect] loadJobsFromDb returned:", jobs.length, "jobs");
    return jobs;
  } catch (error) {
    console.error("[autoconnect] loadJobsFromDb error:", error);
    return [];
  }
}

/**
 * Load recommendations from DB
 */
async function loadRecommendationsFromDb(seedValue?: number | null): Promise<Recommendation[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();

  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadRecommendationsFromDb: seed=1, returning empty to force fallback");
    return [];
  }

  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autoconnect] loadRecommendationsFromDb - effectiveSeed:", effectiveSeed, "baseSeed:", baseSeed);
  console.log("[autoconnect] loadRecommendationsFromDb - Calling fetchSeededSelection...");

  try {
    const recommendations = await fetchSeededSelection<Recommendation>({
      projectKey: "web_9_autoconnect",
      entityType: "recommendations",
      seedValue: effectiveSeed,
      limit: 50,
    });

    console.log("[autoconnect] loadRecommendationsFromDb - fetchSeededSelection completed");
    console.log("[autoconnect] loadRecommendationsFromDb returned:", recommendations.length, "recommendations");

    if (recommendations.length === 0) {
      console.log("[autoconnect] loadRecommendationsFromDb - WARNING: Empty array returned from server");
    }

    return recommendations;
  } catch (error) {
    console.error("[autoconnect] loadRecommendationsFromDb error:", error);
    console.error("[autoconnect] loadRecommendationsFromDb - Error details:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Initialize users with V2 logic
 */
export async function initializeUsers(v2SeedValue?: number | null): Promise<User[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();

  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autoconnect] Base seed is 1 and V2 enabled, using original data (skipping DB mode)");
    return fallbackUsers;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[autoconnect] DB mode enabled, attempting to load from DB...");
    console.log("[autoconnect] baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue);

    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);
    console.log("[autoconnect] Effective seed for DB load:", effectiveSeed);

    try {
      console.log("[autoconnect] Calling fetchSeededSelection with:", {
        projectKey: "web_9_autoconnect",
        entityType: "users",
        seedValue: effectiveSeed,
        limit: 50,
      });

      const users = await fetchSeededSelection<User>({
        projectKey: "web_9_autoconnect",
        entityType: "users",
        seedValue: effectiveSeed,
        limit: 50,
      });

      console.log("[autoconnect] fetchSeededSelection returned:", users?.length, "users");

      if (Array.isArray(users) && users.length > 0) {
        console.log(
          `[autoconnect] ✅ Successfully loaded ${users.length} users from dataset (seed=${effectiveSeed})`
        );
        return users;
      }

      console.warn(`[autoconnect] ⚠️ No users returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.error("[autoconnect] ❌ Backend unavailable, falling back to local JSON. Error:", error);
      if (error instanceof Error) {
        console.error("[autoconnect] Error message:", error.message);
        console.error("[autoconnect] Error stack:", error.stack);
      }
    }
  }

  // Fallback to local JSON
  return fallbackUsers;
}

/**
 * Initialize posts with V2 logic
 */
export async function initializePosts(v2SeedValue?: number | null): Promise<Post[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();

  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autoconnect] Base seed is 1 and V2 enabled, using original data (skipping DB mode)");
    return fallbackPosts;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[autoconnect] DB mode enabled, attempting to load from DB...");
    console.log("[autoconnect] baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue);

    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);
    console.log("[autoconnect] Effective seed for DB load:", effectiveSeed);

    try {
      const posts = await fetchSeededSelection<Post>({
        projectKey: "web_9_autoconnect",
        entityType: "posts",
        seedValue: effectiveSeed,
        limit: 50,
      });

      if (Array.isArray(posts) && posts.length > 0) {
        console.log(
          `[autoconnect] ✅ Successfully loaded ${posts.length} posts from dataset (seed=${effectiveSeed})`
        );
        return posts.map((p) => ({ ...p, comments: p.comments || [] }));
      }

      console.warn(`[autoconnect] ⚠️ No posts returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.error("[autoconnect] ❌ Backend unavailable, falling back to local JSON. Error:", error);
    }
  }

  // Fallback to local JSON
  return fallbackPosts;
}

/**
 * Initialize jobs with V2 logic
 */
export async function initializeJobs(v2SeedValue?: number | null): Promise<Job[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();

  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autoconnect] Base seed is 1 and V2 enabled, using original data (skipping DB mode)");
    return fallbackJobs;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[autoconnect] DB mode enabled, attempting to load from DB...");
    console.log("[autoconnect] baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue);

    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);
    console.log("[autoconnect] Effective seed for DB load:", effectiveSeed);

    try {
      const jobs = await fetchSeededSelection<Job>({
        projectKey: "web_9_autoconnect",
        entityType: "jobs",
        seedValue: effectiveSeed,
        limit: 50,
      });

      if (Array.isArray(jobs) && jobs.length > 0) {
        console.log(
          `[autoconnect] ✅ Successfully loaded ${jobs.length} jobs from dataset (seed=${effectiveSeed})`
        );
        return jobs;
      }

      console.warn(`[autoconnect] ⚠️ No jobs returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.error("[autoconnect] ❌ Backend unavailable, falling back to local JSON. Error:", error);
    }
  }

  // Fallback to local JSON
  return fallbackJobs;
}

/**
 * Initialize recommendations with V2 logic
 */
export async function initializeRecommendations(v2SeedValue?: number | null): Promise<Recommendation[]> {
  const dbModeEnabled = isDbLoadModeEnabled();
  const baseSeed = getBaseSeedFromUrl();

  if (baseSeed === 1 && dbModeEnabled) {
    console.log("[autoconnect] Base seed is 1 and V2 enabled, using original data (skipping DB mode)");
    return fallbackRecommendations;
  }

  // Priority 1: DB mode - fetch from /datasets/load endpoint
  if (dbModeEnabled) {
    console.log("[autoconnect] DB mode enabled, attempting to load from DB...");
    console.log("[autoconnect] baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue);

    if (typeof window !== "undefined" && v2SeedValue == null) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const effectiveSeed = resolveSeed(dbModeEnabled, v2SeedValue);
    console.log("[autoconnect] Effective seed for DB load:", effectiveSeed);

    try {
      const recommendations = await fetchSeededSelection<Recommendation>({
        projectKey: "web_9_autoconnect",
        entityType: "recommendations",
        seedValue: effectiveSeed,
        limit: 50,
      });

      if (Array.isArray(recommendations) && recommendations.length > 0) {
        console.log(
          `[autoconnect] ✅ Successfully loaded ${recommendations.length} recommendations from dataset (seed=${effectiveSeed})`
        );
        return recommendations;
      }

      console.warn(`[autoconnect] ⚠️ No recommendations returned from backend (seed=${effectiveSeed}), falling back to local JSON`);
    } catch (error) {
      console.error("[autoconnect] ❌ Backend unavailable, falling back to local JSON. Error:", error);
    }
  }

  // Fallback to local JSON
  return fallbackRecommendations;
}
