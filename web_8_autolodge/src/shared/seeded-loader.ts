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

export async function fetchSeededSelection<T = unknown>(
  options: SeededLoadOptions
): Promise<T[]> {
  // Always call the server - server determines whether v2 is enabled or disabled
  // When v2 is disabled, server returns the original dataset

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
  console.log("[autolodge/seeded-loader] Fetching from:", url);
  console.log("[autolodge/seeded-loader] Options:", { projectKey: options.projectKey, entityType: options.entityType, seed, limit, method, filterKey: options.filterKey });

  try {
    const resp = await fetch(url, { method: "GET" });
    console.log("[autolodge/seeded-loader] Response status:", resp.status, resp.statusText);

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => "");
      console.error("[autolodge/seeded-loader] Request failed:", resp.status, errorText);
      throw new Error(`Seeded selection request failed: ${resp.status} - ${errorText.slice(0, 200)}`);
    }

    const json = await resp.json();
    console.log("[autolodge/seeded-loader] Response keys:", Object.keys(json));
    console.log("[autolodge/seeded-loader] Data length:", json?.data?.length, "isArray:", Array.isArray(json?.data));

    const result = (json?.data ?? []) as T[];
    console.log("[autolodge/seeded-loader] Returning", result.length, "items");
    return result;
  } catch (error) {
    console.error("[autolodge/seeded-loader] Error in fetchSeededSelection:", error);
    if (error instanceof Error) {
      console.error("[autolodge/seeded-loader] Error message:", error.message);
      console.error("[autolodge/seeded-loader] Error stack:", error.stack);
    }
    throw error;
  }
}

export async function fetchPoolInfo(
  projectKey: string,
  entityType: string
): Promise<{ pool_size: number } | null> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/pool/info?project_key=${encodeURIComponent(
    projectKey
  )}&entity_type=${encodeURIComponent(entityType)}`;
  try {
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) return null;
    const json = await resp.json();
    if (json && typeof json.pool_size === "number") {
      return { pool_size: json.pool_size as number };
    }
    return null;
  } catch {
    return null;
  }
}
