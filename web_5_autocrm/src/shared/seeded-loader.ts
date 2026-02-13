import { isV2Enabled } from "@/dynamic/shared/flags";

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

export interface SeededLoadOptions {
  projectKey: string;
  entityType: string;
  seedValue?: number;
  limit?: number;
  method?: "select" | "shuffle" | "filter" | "distribute";
  filterKey?: string;
  filterValues?: string[];
}

/** Delegates to flags so env is read in one place only */
export function isDbLoadModeEnabled(): boolean {
  return isV2Enabled();
}

export function getSeedValueFromEnv(defaultSeed: number = 1): number {
  // Always return default seed (v2-seed comes from URL parameter, not env vars)
  return defaultSeed;
}

export async function fetchSeededSelection<T = any>(options: SeededLoadOptions): Promise<T[]> {
  // Si el modo DB está deshabilitado, NO hacer ninguna llamada HTTP
  if (!isDbLoadModeEnabled()) {
    console.log(`[seeded-loader] DB mode disabled, skipping API call for ${options.entityType}`);
    return [] as T[];
  }

  const baseUrl = getApiBaseUrl();
  const seed = options.seedValue ?? getSeedValueFromEnv(1);
  const limit = options.limit ?? 50;
  const method = options.method ?? "select";
  const params = new URLSearchParams({
    project_key: options.projectKey,
    entity_type: options.entityType,
    seed_value: String(seed),
    limit: String(limit),
    method,
  });
  if (options.filterKey) params.set("filter_key", options.filterKey);
  if (options.filterValues && options.filterValues.length > 0) {
    params.set("filter_values", options.filterValues.join(","));
  }

  const url = `${baseUrl}/datasets/load?${params.toString()}`;
  console.log("[fetchSeededSelection] request", { url, projectKey: options.projectKey, entityType: options.entityType, seed });
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    console.error("[fetchSeededSelection] request failed", { status: resp.status, body });
    throw new Error(`Seeded selection request failed: ${resp.status}`);
  }
  const json = await resp.json();
  const data = (json?.data ?? []) as T[];
  console.log("[fetchSeededSelection] response", {
    projectKey: options.projectKey,
    entityType: options.entityType,
    seed,
    count: data.length,
    sample: data.slice(0, 3),
  });
  return data;
}
