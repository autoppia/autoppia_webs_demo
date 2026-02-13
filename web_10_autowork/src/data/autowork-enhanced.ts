import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
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
    
    // For other seeds, use base seed directly (v2 seed = base seed)
    return clampSeed(baseSeed);
  }
  
  return 1;
};

/**
 * Load jobs from DB
 */
async function loadJobsFromDb(seedValue?: number | null): Promise<AutoworkJob[]> {
  const baseSeed = getBaseSeedFromUrl();
  const dbModeEnabled = isDbLoadModeEnabled();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadJobsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autowork] loadJobsFromDb - effectiveSeed:", effectiveSeed);
  
  try {
    const jobs = await fetchSeededSelection<AutoworkJob>({
      projectKey: "web_10_autowork",
      entityType: "jobs",
      seedValue: effectiveSeed,
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
  const dbModeEnabled = isDbLoadModeEnabled();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadHiresFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autowork] loadHiresFromDb - effectiveSeed:", effectiveSeed);
  
  try {
    const hires = await fetchSeededSelection<AutoworkHire>({
      projectKey: "web_10_autowork",
      entityType: "hires",
      seedValue: effectiveSeed,
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
  const dbModeEnabled = isDbLoadModeEnabled();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadExpertsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autowork] loadExpertsFromDb - effectiveSeed:", effectiveSeed);
  
  try {
    const experts = await fetchSeededSelection<AutoworkExpert>({
      projectKey: "web_10_autowork",
      entityType: "experts",
      seedValue: effectiveSeed,
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
  const dbModeEnabled = isDbLoadModeEnabled();
  
  // If seed = 1, return empty to force fallback
  if (baseSeed === 1 || seedValue === 1) {
    console.log("[autowork] loadSkillsFromDb: seed=1, returning empty to force fallback");
    return [];
  }
  
  const effectiveSeed = resolveSeed(dbModeEnabled, seedValue);
  console.log("[autowork] loadSkillsFromDb - effectiveSeed:", effectiveSeed);
  
  try {
    const skills = await fetchSeededSelection<string>({
      projectKey: "web_10_autowork",
      entityType: "skills",
      seedValue: effectiveSeed,
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
  
  console.log("[autowork] initializeJobs - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled);
  
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
  
  console.log("[autowork] initializeHires - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled);
  
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
  
  console.log("[autowork] initializeExperts - baseSeed:", baseSeed, "v2SeedValue:", v2SeedValue, "dbModeEnabled:", dbModeEnabled);
  
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
  
  // Fallback to original data
  console.log("[autowork] initializeSkills: Using fallback data (", fallbackSkills.length, "skills)");
  return fallbackSkills;
}
