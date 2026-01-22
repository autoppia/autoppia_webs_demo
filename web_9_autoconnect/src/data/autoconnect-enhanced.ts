import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import type { User, Post, Job, Recommendation } from "@/library/dataset";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
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

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const origin = typeof window !== "undefined" ? window.location?.origin : undefined;
  const envIsLocal = envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"));
  const originIsLocal = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"));

  if (envUrl && (!(envIsLocal) || originIsLocal)) {
    return envUrl;
  }
  if (origin) {
    return `${origin}/api`;
  }
  return envUrl || "http://app:8090";
}

/**
 * Fetch AI generated users from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedUsers(count: number): Promise<User[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autoconnect] fetchAiGeneratedUsers - URL:", url, "count:", count);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_key: "web_9_autoconnect",
        entity_type: "users",
        count,
      }),
    });

    console.log("[autoconnect] fetchAiGeneratedUsers - Response status:", response.status);

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const json = await response.json();
    console.log("[autoconnect] fetchAiGeneratedUsers - Response keys:", Object.keys(json || {}));
    console.log("[autoconnect] fetchAiGeneratedUsers - Response data:", json?.generated_data?.length || 0, "users");
    
    const generatedData = json?.generated_data ?? [];
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autoconnect] fetchAiGeneratedUsers - Invalid or empty generated data");
      throw new Error("No data returned from AI generation endpoint");
    }
    
    return generatedData as User[];
  } catch (error) {
    console.error("[autoconnect] fetchAiGeneratedUsers error:", error);
    throw error;
  }
}

/**
 * Fetch AI generated posts from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedPosts(count: number): Promise<Post[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autoconnect] fetchAiGeneratedPosts - URL:", url, "count:", count);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_key: "web_9_autoconnect",
        entity_type: "posts",
        count,
      }),
    });

    console.log("[autoconnect] fetchAiGeneratedPosts - Response status:", response.status);

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const json = await response.json();
    console.log("[autoconnect] fetchAiGeneratedPosts - Response keys:", Object.keys(json || {}));
    console.log("[autoconnect] fetchAiGeneratedPosts - Response data:", json?.generated_data?.length || 0, "posts");
    
    const generatedData = json?.generated_data ?? [];
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autoconnect] fetchAiGeneratedPosts - Invalid or empty generated data");
      throw new Error("No data returned from AI generation endpoint");
    }
    
    return generatedData.map((p: Post) => ({ ...p, comments: p.comments || [] })) as Post[];
  } catch (error) {
    console.error("[autoconnect] fetchAiGeneratedPosts error:", error);
    throw error;
  }
}

/**
 * Fetch AI generated jobs from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedJobs(count: number): Promise<Job[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autoconnect] fetchAiGeneratedJobs - URL:", url, "count:", count);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_key: "web_9_autoconnect",
        entity_type: "jobs",
        count,
      }),
    });

    console.log("[autoconnect] fetchAiGeneratedJobs - Response status:", response.status);

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const json = await response.json();
    console.log("[autoconnect] fetchAiGeneratedJobs - Response keys:", Object.keys(json || {}));
    console.log("[autoconnect] fetchAiGeneratedJobs - Response data:", json?.generated_data?.length || 0, "jobs");
    
    const generatedData = json?.generated_data ?? [];
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autoconnect] fetchAiGeneratedJobs - Invalid or empty generated data");
      throw new Error("No data returned from AI generation endpoint");
    }
    
    return generatedData as Job[];
  } catch (error) {
    console.error("[autoconnect] fetchAiGeneratedJobs error:", error);
    throw error;
  }
}

/**
 * Fetch AI generated recommendations from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedRecommendations(count: number): Promise<Recommendation[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autoconnect] fetchAiGeneratedRecommendations - URL:", url, "count:", count);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_key: "web_9_autoconnect",
        entity_type: "recommendations",
        count,
      }),
    });

    console.log("[autoconnect] fetchAiGeneratedRecommendations - Response status:", response.status);

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const json = await response.json();
    console.log("[autoconnect] fetchAiGeneratedRecommendations - Response keys:", Object.keys(json || {}));
    console.log("[autoconnect] fetchAiGeneratedRecommendations - Response data:", json?.generated_data?.length || 0, "recommendations");
    
    const generatedData = json?.generated_data ?? [];
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autoconnect] fetchAiGeneratedRecommendations - Invalid or empty generated data");
      throw new Error("No data returned from AI generation endpoint");
    }
    
    return generatedData as Recommendation[];
  } catch (error) {
    console.error("[autoconnect] fetchAiGeneratedRecommendations error:", error);
    throw error;
  }
}

/**
 * Load users from DB
 */
async function loadUsersFromDb(seedValue?: number | null): Promise<User[]> {
  const baseSeed = getBaseSeedFromUrl();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadUsersFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autoconnect] loadUsersFromDb - seed:", seed);
  
  try {
    const users = await fetchSeededSelection<User>({
      projectKey: "web_9_autoconnect",
      entityType: "users",
      seedValue: seed,
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
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadPostsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autoconnect] loadPostsFromDb - seed:", seed);
  
  try {
    const posts = await fetchSeededSelection<Post>({
      projectKey: "web_9_autoconnect",
      entityType: "posts",
      seedValue: seed,
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
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadJobsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autoconnect] loadJobsFromDb - seed:", seed);
  
  try {
    const jobs = await fetchSeededSelection<Job>({
      projectKey: "web_9_autoconnect",
      entityType: "jobs",
      seedValue: seed,
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
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autoconnect] loadRecommendationsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autoconnect] loadRecommendationsFromDb - seed:", seed, "baseSeed:", baseSeed);
  console.log("[autoconnect] loadRecommendationsFromDb - Calling fetchSeededSelection...");
  
  try {
    const recommendations = await fetchSeededSelection<Recommendation>({
      projectKey: "web_9_autoconnect",
      entityType: "recommendations",
      seedValue: seed,
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
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autoconnect] initializeUsers - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled);
  
  // Special case: if baseSeed = 1, use fallback data directly
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autoconnect] initializeUsers: baseSeed=1, using fallback data");
    return fallbackUsers;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    const dbUsers = await loadUsersFromDb(v2SeedValue);
    if (dbUsers.length > 0) {
      console.log("[autoconnect] initializeUsers: ✅ Loaded", dbUsers.length, "users from DB");
      return dbUsers;
    }
  }
  
  // Try AI generation if enabled (and DB mode didn't return data)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      const runtimeSeed = getRuntimeV2Seed();
      const seed = v2SeedValue ?? runtimeSeed ?? 1;
      const aiUsers = await fetchAiGeneratedUsers(50);
      if (aiUsers.length > 0) {
        console.log("[autoconnect] initializeUsers: ✅ Generated", aiUsers.length, "users via AI");
        return aiUsers;
      }
    } catch (error) {
      console.error("[autoconnect] initializeUsers: AI generation failed:", error);
    }
  }
  
  // Fallback to original data
  console.log("[autoconnect] initializeUsers: Using fallback data (", fallbackUsers.length, "users)");
  return fallbackUsers;
}

/**
 * Initialize posts with V2 logic
 */
export async function initializePosts(v2SeedValue?: number | null): Promise<Post[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autoconnect] initializePosts - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled);
  
  // Special case: if baseSeed = 1, use fallback data directly
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autoconnect] initializePosts: baseSeed=1, using fallback data");
    return fallbackPosts;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    const dbPosts = await loadPostsFromDb(v2SeedValue);
    if (dbPosts.length > 0) {
      console.log("[autoconnect] initializePosts: ✅ Loaded", dbPosts.length, "posts from DB");
      return dbPosts;
    }
  }
  
  // Try AI generation if enabled (and DB mode didn't return data)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      const runtimeSeed = getRuntimeV2Seed();
      const seed = v2SeedValue ?? runtimeSeed ?? 1;
      const aiPosts = await fetchAiGeneratedPosts(50);
      if (aiPosts.length > 0) {
        console.log("[autoconnect] initializePosts: ✅ Generated", aiPosts.length, "posts via AI");
        return aiPosts;
      }
    } catch (error) {
      console.error("[autoconnect] initializePosts: AI generation failed:", error);
    }
  }
  
  // Fallback to original data
  console.log("[autoconnect] initializePosts: Using fallback data (", fallbackPosts.length, "posts)");
  return fallbackPosts;
}

/**
 * Initialize jobs with V2 logic
 */
export async function initializeJobs(v2SeedValue?: number | null): Promise<Job[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autoconnect] initializeJobs - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled);
  
  // Special case: if baseSeed = 1, use fallback data directly
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autoconnect] initializeJobs: baseSeed=1, using fallback data");
    return fallbackJobs;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    const dbJobs = await loadJobsFromDb(v2SeedValue);
    if (dbJobs.length > 0) {
      console.log("[autoconnect] initializeJobs: ✅ Loaded", dbJobs.length, "jobs from DB");
      return dbJobs;
    }
  }
  
  // Try AI generation if enabled (and DB mode didn't return data)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      const runtimeSeed = getRuntimeV2Seed();
      const seed = v2SeedValue ?? runtimeSeed ?? 1;
      const aiJobs = await fetchAiGeneratedJobs(50);
      if (aiJobs.length > 0) {
        console.log("[autoconnect] initializeJobs: ✅ Generated", aiJobs.length, "jobs via AI");
        return aiJobs;
      }
    } catch (error) {
      console.error("[autoconnect] initializeJobs: AI generation failed:", error);
    }
  }
  
  // Fallback to original data
  console.log("[autoconnect] initializeJobs: Using fallback data (", fallbackJobs.length, "jobs)");
  return fallbackJobs;
}

/**
 * Initialize recommendations with V2 logic
 */
export async function initializeRecommendations(v2SeedValue?: number | null): Promise<Recommendation[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autoconnect] initializeRecommendations - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled);
  
  // Special case: if baseSeed = 1, use fallback data directly
  if (baseSeed === 1 && (dbModeEnabled || aiGenerateEnabled)) {
    console.log("[autoconnect] initializeRecommendations: baseSeed=1, using fallback data");
    return fallbackRecommendations;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    console.log("[autoconnect] initializeRecommendations: DB mode enabled, calling loadRecommendationsFromDb...");
    const dbRecommendations = await loadRecommendationsFromDb(v2SeedValue);
    console.log("[autoconnect] initializeRecommendations: loadRecommendationsFromDb returned", dbRecommendations.length, "recommendations");
    if (dbRecommendations.length > 0) {
      console.log("[autoconnect] initializeRecommendations: ✅ Loaded", dbRecommendations.length, "recommendations from DB");
      return dbRecommendations;
    } else {
      console.log("[autoconnect] initializeRecommendations: ⚠️ DB returned empty array, will try fallback");
    }
  } else {
    console.log("[autoconnect] initializeRecommendations: DB mode not enabled");
  }
  
  // Try AI generation if enabled (and DB mode didn't return data)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      const runtimeSeed = getRuntimeV2Seed();
      const seed = v2SeedValue ?? runtimeSeed ?? 1;
      const aiRecommendations = await fetchAiGeneratedRecommendations(50);
      if (aiRecommendations.length > 0) {
        console.log("[autoconnect] initializeRecommendations: ✅ Generated", aiRecommendations.length, "recommendations via AI");
        return aiRecommendations;
      }
    } catch (error) {
      console.error("[autoconnect] initializeRecommendations: AI generation failed:", error);
    }
  }
  
  // Fallback to original data
  console.log("[autoconnect] initializeRecommendations: Using fallback data (", fallbackRecommendations.length, "recommendations)");
  return fallbackRecommendations;
}
