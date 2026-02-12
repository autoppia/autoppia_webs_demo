import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import { isV2AiGenerateEnabled } from "@/dynamic/shared/flags";
import { resolveSeedsSync, clampBaseSeed } from "@/shared/seed-resolver";
import { jobs, hires, experts, popularSkills } from "@/library/dataset";
import type { AutoworkJob, AutoworkHire, AutoworkExpert } from "@/shared/data-generator";

// Import fallback data
let fallbackJobs: AutoworkJob[] = [];
let fallbackHires: AutoworkHire[] = [];
let fallbackExperts: AutoworkExpert[] = [];
let fallbackSkills: string[] = [];

try {
  const jobsData = require("./original/jobs_1.json");
  if (Array.isArray(jobsData) && jobsData.length > 0) {
    fallbackJobs = jobsData as AutoworkJob[];
  }
} catch (e) {
  console.log("[autowork] Original jobs data not found, using library dataset");
  fallbackJobs = (jobs as any[]).map((j) => ({
    id: `job-${Math.random().toString(36).substr(2, 9)}`,
    title: j.title || "",
    status: (j.status as any) || "Open",
    location: "Unknown",
    budget: j.time || "$0",
    requiredSkills: ["General"],
    postedDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }));
}

try {
  const hiresData = require("./original/hires_1.json");
  if (Array.isArray(hiresData) && hiresData.length > 0) {
    fallbackHires = hiresData as AutoworkHire[];
  }
} catch (e) {
  console.log("[autowork] Original hires data not found, using library dataset");
  fallbackHires = (hires as any[]).map((h) => ({
    name: h.name || "",
    country: h.country || "",
    rate: h.rate || "$0/hr",
    rating: h.rating || 4.0,
    jobs: h.jobs || 0,
    role: h.role || "",
    avatar: h.avatar || "",
    rehire: h.rehire || false,
  }));
}

try {
  const expertsData = require("./original/experts_1.json");
  if (Array.isArray(expertsData) && expertsData.length > 0) {
    fallbackExperts = expertsData as AutoworkExpert[];
  }
} catch (e) {
  console.log("[autowork] Original experts data not found, using library dataset");
  fallbackExperts = (experts as any[]).map((e) => ({
    slug: e.slug || "",
    name: e.name || "",
    country: e.country || "",
    role: e.role || "",
    avatar: e.avatar || "",
    rate: e.rate || "$0/hr",
    rating: e.rating || 4.0,
    jobs: e.jobs || 0,
    specialties: [],
    bio: e.about || "",
  }));
}

try {
  const skillsData = require("./original/skills_1.json");
  if (Array.isArray(skillsData) && skillsData.length > 0) {
    fallbackSkills = skillsData as string[];
  }
} catch (e) {
  console.log("[autowork] Original skills data not found, using library dataset");
  fallbackSkills = [...popularSkills];
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
  const value = (window as any).__autoworkV2Seed;
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
 * Fetch AI generated jobs from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedJobs(count: number): Promise<AutoworkJob[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autowork] fetchAiGeneratedJobs - URL:", url, "count:", count);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_key: "web_10_autowork",
        entity_type: "jobs",
        count,
      }),
    });

    console.log("[autowork] fetchAiGeneratedJobs - Response status:", response.status);

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const json = await response.json();
    console.log("[autowork] fetchAiGeneratedJobs - Response keys:", Object.keys(json || {}));
    console.log("[autowork] fetchAiGeneratedJobs - Response data:", json?.generated_data?.length || 0, "jobs");
    
    const generatedData = json?.generated_data ?? [];
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autowork] fetchAiGeneratedJobs - Invalid or empty generated data");
      throw new Error("No data returned from AI generation endpoint");
    }
    
    return generatedData as AutoworkJob[];
  } catch (error) {
    console.error("[autowork] fetchAiGeneratedJobs error:", error);
    throw error;
  }
}

/**
 * Fetch AI generated hires from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedHires(count: number): Promise<AutoworkHire[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autowork] fetchAiGeneratedHires - URL:", url, "count:", count);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_key: "web_10_autowork",
        entity_type: "hires",
        count,
      }),
    });

    console.log("[autowork] fetchAiGeneratedHires - Response status:", response.status);

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const json = await response.json();
    console.log("[autowork] fetchAiGeneratedHires - Response keys:", Object.keys(json || {}));
    console.log("[autowork] fetchAiGeneratedHires - Response data:", json?.generated_data?.length || 0, "hires");
    
    const generatedData = json?.generated_data ?? [];
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autowork] fetchAiGeneratedHires - Invalid or empty generated data");
      throw new Error("No data returned from AI generation endpoint");
    }
    
    return generatedData as AutoworkHire[];
  } catch (error) {
    console.error("[autowork] fetchAiGeneratedHires error:", error);
    throw error;
  }
}

/**
 * Fetch AI generated experts from /datasets/generate-smart endpoint
 */
async function fetchAiGeneratedExperts(count: number): Promise<AutoworkExpert[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/generate-smart`;
  
  console.log("[autowork] fetchAiGeneratedExperts - URL:", url, "count:", count);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_key: "web_10_autowork",
        entity_type: "experts",
        count,
      }),
    });

    console.log("[autowork] fetchAiGeneratedExperts - Response status:", response.status);

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const json = await response.json();
    console.log("[autowork] fetchAiGeneratedExperts - Response keys:", Object.keys(json || {}));
    console.log("[autowork] fetchAiGeneratedExperts - Response data:", json?.generated_data?.length || 0, "experts");
    
    const generatedData = json?.generated_data ?? [];
    if (!Array.isArray(generatedData) || generatedData.length === 0) {
      console.error("[autowork] fetchAiGeneratedExperts - Invalid or empty generated data");
      throw new Error("No data returned from AI generation endpoint");
    }
    
    return generatedData as AutoworkExpert[];
  } catch (error) {
    console.error("[autowork] fetchAiGeneratedExperts error:", error);
    throw error;
  }
}

/**
 * Load jobs from DB
 */
async function loadJobsFromDb(seedValue?: number | null): Promise<AutoworkJob[]> {
  const baseSeed = getBaseSeedFromUrl();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadJobsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autowork] loadJobsFromDb - seed:", seed);
  
  try {
    const jobs = await fetchSeededSelection<AutoworkJob>({
      projectKey: "web_10_autowork",
      entityType: "jobs",
      seedValue: seed,
      limit: 50,
    });
    
    console.log("[autowork] loadJobsFromDb returned:", jobs.length, "jobs");
    return jobs;
  } catch (error) {
    console.error("[autowork] loadJobsFromDb error:", error);
    return [];
  }
}

/**
 * Load hires from DB
 */
async function loadHiresFromDb(seedValue?: number | null): Promise<AutoworkHire[]> {
  const baseSeed = getBaseSeedFromUrl();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadHiresFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autowork] loadHiresFromDb - seed:", seed);
  
  try {
    const hires = await fetchSeededSelection<AutoworkHire>({
      projectKey: "web_10_autowork",
      entityType: "hires",
      seedValue: seed,
      limit: 50,
    });
    
    console.log("[autowork] loadHiresFromDb returned:", hires.length, "hires");
    return hires;
  } catch (error) {
    console.error("[autowork] loadHiresFromDb error:", error);
    return [];
  }
}

/**
 * Load experts from DB
 */
async function loadExpertsFromDb(seedValue?: number | null): Promise<AutoworkExpert[]> {
  const baseSeed = getBaseSeedFromUrl();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadExpertsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autowork] loadExpertsFromDb - seed:", seed);
  
  try {
    const experts = await fetchSeededSelection<AutoworkExpert>({
      projectKey: "web_10_autowork",
      entityType: "experts",
      seedValue: seed,
      limit: 50,
    });
    
    console.log("[autowork] loadExpertsFromDb returned:", experts.length, "experts");
    return experts;
  } catch (error) {
    console.error("[autowork] loadExpertsFromDb error:", error);
    return [];
  }
}

/**
 * Load skills from DB (or generate deterministically)
 */
async function loadSkillsFromDb(seedValue?: number | null): Promise<string[]> {
  const baseSeed = getBaseSeedFromUrl();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadSkillsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const runtimeSeed = getRuntimeV2Seed();
  const seed = seedValue ?? runtimeSeed ?? 1;
  
  console.log("[autowork] loadSkillsFromDb - seed:", seed);
  
  try {
    const skills = await fetchSeededSelection<string>({
      projectKey: "web_10_autowork",
      entityType: "skills",
      seedValue: seed,
      limit: 50,
      method: "select",
    });
    
    console.log("[autowork] loadSkillsFromDb returned:", skills.length, "skills");
    return skills;
  } catch (error) {
    console.error("[autowork] loadSkillsFromDb error:", error);
    return [];
  }
}

/**
 * Initialize jobs with V2 logic
 */
export async function initializeJobs(v2SeedValue?: number | null): Promise<AutoworkJob[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autowork] initializeJobs - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled);
  
  // Special case: if baseSeed = 1, ALWAYS use fallback data directly (skip API calls)
  if (baseSeed === 1) {
    console.log("[autowork] initializeJobs: baseSeed=1, using fallback data (skipping API calls)");
    return fallbackJobs;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    const dbJobs = await loadJobsFromDb(v2SeedValue);
    if (dbJobs.length > 0) {
      console.log("[autowork] initializeJobs: ✅ Loaded", dbJobs.length, "jobs from DB");
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
        console.log("[autowork] initializeJobs: ✅ Generated", aiJobs.length, "jobs via AI");
        return aiJobs;
      }
    } catch (error) {
      console.error("[autowork] initializeJobs: AI generation failed:", error);
    }
  }
  
  // Fallback to original data
  console.log("[autowork] initializeJobs: Using fallback data (", fallbackJobs.length, "jobs)");
  return fallbackJobs;
}

/**
 * Initialize hires with V2 logic
 */
export async function initializeHires(v2SeedValue?: number | null): Promise<AutoworkHire[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autowork] initializeHires - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled);
  
  // Special case: if baseSeed = 1, ALWAYS use fallback data directly (skip API calls)
  if (baseSeed === 1) {
    console.log("[autowork] initializeHires: baseSeed=1, using fallback data (skipping API calls)");
    return fallbackHires;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    const dbHires = await loadHiresFromDb(v2SeedValue);
    if (dbHires.length > 0) {
      console.log("[autowork] initializeHires: ✅ Loaded", dbHires.length, "hires from DB");
      return dbHires;
    }
  }
  
  // Try AI generation if enabled (and DB mode didn't return data)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      const runtimeSeed = getRuntimeV2Seed();
      const seed = v2SeedValue ?? runtimeSeed ?? 1;
      const aiHires = await fetchAiGeneratedHires(50);
      if (aiHires.length > 0) {
        console.log("[autowork] initializeHires: ✅ Generated", aiHires.length, "hires via AI");
        return aiHires;
      }
    } catch (error) {
      console.error("[autowork] initializeHires: AI generation failed:", error);
    }
  }
  
  // Fallback to original data
  console.log("[autowork] initializeHires: Using fallback data (", fallbackHires.length, "hires)");
  return fallbackHires;
}

/**
 * Initialize experts with V2 logic
 */
export async function initializeExperts(v2SeedValue?: number | null): Promise<AutoworkExpert[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  const aiGenerateEnabled = isV2AiGenerateEnabled();
  
  console.log("[autowork] initializeExperts - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled, "aiGenerateEnabled:", aiGenerateEnabled);
  
  // Special case: if baseSeed = 1, ALWAYS use fallback data directly (skip API calls)
  if (baseSeed === 1) {
    console.log("[autowork] initializeExperts: baseSeed=1, using fallback data (skipping API calls)");
    return fallbackExperts;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    const dbExperts = await loadExpertsFromDb(v2SeedValue);
    if (dbExperts.length > 0) {
      console.log("[autowork] initializeExperts: ✅ Loaded", dbExperts.length, "experts from DB");
      return dbExperts;
    }
  }
  
  // Try AI generation if enabled (and DB mode didn't return data)
  if (aiGenerateEnabled && !dbModeEnabled) {
    try {
      const runtimeSeed = getRuntimeV2Seed();
      const seed = v2SeedValue ?? runtimeSeed ?? 1;
      const aiExperts = await fetchAiGeneratedExperts(50);
      if (aiExperts.length > 0) {
        console.log("[autowork] initializeExperts: ✅ Generated", aiExperts.length, "experts via AI");
        return aiExperts;
      }
    } catch (error) {
      console.error("[autowork] initializeExperts: AI generation failed:", error);
    }
  }
  
  // Fallback to original data
  console.log("[autowork] initializeExperts: Using fallback data (", fallbackExperts.length, "experts)");
  return fallbackExperts;
}

/**
 * Initialize skills with V2 logic
 */
export async function initializeSkills(v2SeedValue?: number | null): Promise<string[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  
  console.log("[autowork] initializeSkills - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled);
  
  // Special case: if baseSeed = 1, ALWAYS use fallback data directly (skip API calls)
  if (baseSeed === 1) {
    console.log("[autowork] initializeSkills: baseSeed=1, using fallback data (skipping API calls)");
    return fallbackSkills;
  }
  
  // Try DB mode first if enabled
  if (dbModeEnabled) {
    const dbSkills = await loadSkillsFromDb(v2SeedValue);
    if (dbSkills.length > 0) {
      console.log("[autowork] initializeSkills: ✅ Loaded", dbSkills.length, "skills from DB");
      return dbSkills;
    }
  }
  
  // Fallback to original data (skills don't use AI generation)
  console.log("[autowork] initializeSkills: Using fallback data (", fallbackSkills.length, "skills)");
  return fallbackSkills;
}
