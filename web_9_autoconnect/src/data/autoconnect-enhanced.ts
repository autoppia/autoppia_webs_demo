import { fetchSeededSelection } from "@/shared/seeded-loader";
import type { User, Post, Job, Recommendation } from "@/library/dataset";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";

/**
 * Get v2 seed from window (synchronized by SeedContext)
 */
const getRuntimeV2Seed = (): number | null => {
  if (typeof window === "undefined") return null;
  const value = (window as any).__autoconnectV2Seed;
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampBaseSeed(value);
  }
  return null;
};

const resolveSeed = (seedValue?: number | null): number => {
  if (typeof seedValue === "number" && Number.isFinite(seedValue)) {
    return clampBaseSeed(seedValue);
  }

  const baseSeed = getBaseSeedFromUrl();
  if (baseSeed !== null) {
    return clampBaseSeed(baseSeed);
  }

  return 1;
};

/**
 * Initialize users from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeUsers(v2SeedValue?: number | null): Promise<User[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autoconnect] Fetching users from server with seed:", effectiveSeed);

  try {
    const users = await fetchSeededSelection<User>({
      projectKey: "web_9_autoconnect",
      entityType: "users",
      seedValue: effectiveSeed,
      limit: 50,
    });

    if (Array.isArray(users) && users.length > 0) {
      console.log(`[autoconnect] ✅ Successfully loaded ${users.length} users from server (seed=${effectiveSeed})`);
      return users;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autoconnect] Failed to fetch users from server:", error);
    throw error;
  }
}

/**
 * Initialize posts from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializePosts(v2SeedValue?: number | null): Promise<Post[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autoconnect] Fetching posts from server with seed:", effectiveSeed);

  try {
    const posts = await fetchSeededSelection<Post>({
      projectKey: "web_9_autoconnect",
      entityType: "posts",
      seedValue: effectiveSeed,
      limit: 50,
    });

    if (Array.isArray(posts) && posts.length > 0) {
      console.log(`[autoconnect] ✅ Successfully loaded ${posts.length} posts from server (seed=${effectiveSeed})`);
      return posts.map((p) => ({ ...p, comments: p.comments || [] }));
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autoconnect] Failed to fetch posts from server:", error);
    throw error;
  }
}

/**
 * Initialize jobs from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeJobs(v2SeedValue?: number | null): Promise<Job[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autoconnect] Fetching jobs from server with seed:", effectiveSeed);

  try {
    const jobs = await fetchSeededSelection<Job>({
      projectKey: "web_9_autoconnect",
      entityType: "jobs",
      seedValue: effectiveSeed,
      limit: 50,
    });

    if (Array.isArray(jobs) && jobs.length > 0) {
      console.log(`[autoconnect] ✅ Successfully loaded ${jobs.length} jobs from server (seed=${effectiveSeed})`);
      return jobs;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autoconnect] Failed to fetch jobs from server:", error);
    throw error;
  }
}

/**
 * Initialize recommendations from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeRecommendations(v2SeedValue?: number | null): Promise<Recommendation[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autoconnect] Fetching recommendations from server with seed:", effectiveSeed);

  try {
    const recommendations = await fetchSeededSelection<Recommendation>({
      projectKey: "web_9_autoconnect",
      entityType: "recommendations",
      seedValue: effectiveSeed,
      limit: 50,
    });

    if (Array.isArray(recommendations) && recommendations.length > 0) {
      console.log(`[autoconnect] ✅ Successfully loaded ${recommendations.length} recommendations from server (seed=${effectiveSeed})`);
      return recommendations;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autoconnect] Failed to fetch recommendations from server:", error);
    throw error;
  }
}
