import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampBaseSeed, getBaseSeedFromUrl } from "@/shared/seed-resolver";
import type { AutoworkJob, AutoworkHire, AutoworkExpert } from "@/shared/data-generator";

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
 * Initialize jobs from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeJobs(v2SeedValue?: number | null): Promise<AutoworkJob[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autowork] Fetching jobs from server with seed:", effectiveSeed);

  try {
    const jobs = await fetchSeededSelection<AutoworkJob>({
      projectKey: "web_10_autowork",
      entityType: "jobs",
      seedValue: effectiveSeed,
      limit: 50,
    });

    if (Array.isArray(jobs) && jobs.length > 0) {
      console.log(`[autowork] ✅ Successfully loaded ${jobs.length} jobs from server (seed=${effectiveSeed})`);
      return jobs;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autowork] Failed to fetch jobs from server:", error);
    throw error;
  }
}

/**
 * Initialize hires from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeHires(v2SeedValue?: number | null): Promise<AutoworkHire[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autowork] Fetching hires from server with seed:", effectiveSeed);

  try {
    const hires = await fetchSeededSelection<AutoworkHire>({
      projectKey: "web_10_autowork",
      entityType: "hires",
      seedValue: effectiveSeed,
      limit: 50,
    });

    if (Array.isArray(hires) && hires.length > 0) {
      console.log(`[autowork] ✅ Successfully loaded ${hires.length} hires from server (seed=${effectiveSeed})`);
      return hires;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autowork] Failed to fetch hires from server:", error);
    throw error;
  }
}

/**
 * Initialize experts from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeExperts(v2SeedValue?: number | null): Promise<AutoworkExpert[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autowork] Fetching experts from server with seed:", effectiveSeed);

  try {
    const experts = await fetchSeededSelection<AutoworkExpert>({
      projectKey: "web_10_autowork",
      entityType: "experts",
      seedValue: effectiveSeed,
      limit: 50,
    });

    if (Array.isArray(experts) && experts.length > 0) {
      console.log(`[autowork] ✅ Successfully loaded ${experts.length} experts from server (seed=${effectiveSeed})`);
      return experts;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autowork] Failed to fetch experts from server:", error);
    throw error;
  }
}

/**
 * Initialize skills from server endpoint /datasets/load.
 * Server determines whether v2 is enabled or disabled and returns appropriate data.
 */
export async function initializeSkills(v2SeedValue?: number | null): Promise<string[]> {
  const baseSeed = getBaseSeedFromUrl();

  if (typeof window !== "undefined" && v2SeedValue == null) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const effectiveSeed = resolveSeed(v2SeedValue);
  console.log("[autowork] Fetching skills from server with seed:", effectiveSeed);

  try {
    const skills = await fetchSeededSelection<string>({
      projectKey: "web_10_autowork",
      entityType: "skills",
      seedValue: effectiveSeed,
      limit: 50,
      method: "select",
    });

    if (Array.isArray(skills) && skills.length > 0) {
      console.log(`[autowork] ✅ Successfully loaded ${skills.length} skills from server (seed=${effectiveSeed})`);
      return skills;
    } else {
      throw new Error("Server returned empty array");
    }
  } catch (error) {
    console.error("[autowork] Failed to fetch skills from server:", error);
    throw error;
  }
}
