"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSeededSelection, isDbLoadModeEnabled } from "@/shared/seeded-loader";
import { useSeedLayout } from "@/library/useSeedLayout";

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
  const { v2Seed } = useSeedLayout();
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
        let effectiveSeed = 1;

        if (dbModeEnabled) {
          // Use v2Seed if provided, otherwise default to 1
          effectiveSeed = v2Seed ?? 1;
        }

        console.log(`[useAutoworkData] Loading ${entityType} with seed=${effectiveSeed}`);

        const result = await fetchSeededSelection<T>({
          projectKey: BASE_PROJECT_KEY,
          entityType,
          seedValue: effectiveSeed,
          limit: count,
          method: selectionMethod,
        });

        if (cancelled) return;
        setData(result || []);
        console.log(`[useAutoworkData] Loaded ${result?.length || 0} ${entityType} with seed=${effectiveSeed}`);
      } catch (err: any) {
        if (cancelled) return;
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
