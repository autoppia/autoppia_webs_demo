"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { useSeed as useSeedContext } from "@/context/SeedContext";
import { jobs, hires, experts, popularSkills } from "@/library/dataset";

const BASE_PROJECT_KEY = "web_10_autowork";

const ENTITY_MAP: Record<string, string> = {
  web_10_autowork_jobs: "jobs",
  web_10_autowork_hires: "hires",
  web_10_autowork_experts: "experts",
  web_10_autowork_skills: "skills",
};

function resolveEntityType(projectKey: string): string {
  if (ENTITY_MAP[projectKey]) return ENTITY_MAP[projectKey];
  if (projectKey.startsWith("web_10_autowork_")) {
    const suffix = projectKey.replace("web_10_autowork_", "");
    return suffix || "jobs";
  }
  if (projectKey.startsWith("web_10_")) {
    const suffix = projectKey.replace("web_10_", "");
    return suffix || "jobs";
  }
  return projectKey;
}

// Seeded random number generator
const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

// Pick random element from array
const pick = <T,>(rng: () => number, collection: T[]): T =>
  collection[Math.floor(rng() * collection.length)];

// Shuffle array deterministically based on seed
const seededShuffle = <T,>(array: T[], seed: number): T[] => {
  const rng = seededRandom(seed);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Generate deterministic data based on seed
function generateDeterministicData<T>(
  entityType: string,
  seed: number,
  limit: number
): T[] {
  const rng = seededRandom(seed);
  
  switch (entityType) {
    case "jobs": {
      const shuffled = seededShuffle(jobs, seed);
      return shuffled.slice(0, limit) as T[];
    }
    case "hires": {
      const shuffled = seededShuffle(hires, seed);
      return shuffled.slice(0, limit) as T[];
    }
    case "experts": {
      const shuffled = seededShuffle(experts, seed);
      return shuffled.slice(0, limit) as T[];
    }
    case "skills": {
      const shuffled = seededShuffle(popularSkills, seed);
      return shuffled.slice(0, limit) as T[];
    }
    default:
      return [];
  }
}

export type UseAutoworkDataResult<T> = {
  data: T[];
  isLoading: boolean;
  statusMessage: string | null;
  error: string | null;
  reload: () => void;
};

export function useAutoworkData<T = any>(projectKey: string, count: number = 12): UseAutoworkDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const { resolvedSeeds } = useSeedContext();
  // Use v2 seed if available, otherwise fall back to base seed
  // This ensures data changes based on seed even when v2 is not explicitly enabled
  const v2Seed = resolvedSeeds.v2 !== null && resolvedSeeds.v2 !== undefined 
    ? resolvedSeeds.v2 
    : (resolvedSeeds.base ?? 1);
  const entityType = useMemo(() => resolveEntityType(projectKey), [projectKey]);
  const selectionMethod = entityType === "skills" ? "select" : "shuffle";

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      setStatusMessage(null);

      try {
        const dbModeEnabled = isDbLoadModeEnabled();
        const effectiveSeed = v2Seed ?? 1;

        console.log(`[useAutoworkData] Loading ${entityType} with seed=${effectiveSeed}, dbMode=${dbModeEnabled}`);

        // If DB mode is disabled, use deterministic fallback
        if (!dbModeEnabled) {
          const fallbackData = generateDeterministicData<T>(entityType, effectiveSeed, count);
          if (cancelled) return;
          setData(fallbackData);
          console.log(`[useAutoworkData] Loaded ${fallbackData.length} ${entityType} from fallback with seed=${effectiveSeed}`);
          return;
        }

        // Try to fetch from API
        try {
          const result = await fetchSeededSelection<T>({
            projectKey: BASE_PROJECT_KEY,
            entityType,
            seedValue: effectiveSeed,
            limit: count,
            method: selectionMethod,
          });

          if (cancelled) return;
          setData(result || []);
          console.log(`[useAutoworkData] Loaded ${result?.length || 0} ${entityType} from API with seed=${effectiveSeed}`);
        } catch (apiErr: any) {
          // API failed, fallback to deterministic data
          console.warn(`[useAutoworkData] API failed for ${entityType}, using fallback:`, apiErr?.message);
          const fallbackData = generateDeterministicData<T>(entityType, effectiveSeed, count);
          if (cancelled) return;
          setData(fallbackData);
          console.log(`[useAutoworkData] Loaded ${fallbackData.length} ${entityType} from fallback with seed=${effectiveSeed}`);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error(`[useAutoworkData] Error loading ${entityType}:`, err);
        // Last resort: try fallback
        const fallbackData = generateDeterministicData<T>(entityType, v2Seed ?? 1, count);
        setData(fallbackData);
        setError(err?.message || "Failed to load dataset");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [entityType, count, selectionMethod, v2Seed, nonce]);

  const reload = () => setNonce((n) => n + 1);

  return { data, isLoading, statusMessage, error, reload };
}
