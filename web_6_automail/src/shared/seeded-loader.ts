import { fetchWithRetry } from "./fetchWithRetry";

function getApiBaseUrl(): string {
  const isServer = typeof window === "undefined";
  // Server (e.g. Docker): use only API_URL so backend is reached at app:8090.
  // Never use NEXT_PUBLIC_* here — it's inlined at build time (often localhost) and would cause ECONNREFUSED in containers.
  if (isServer) {
    return process.env.API_URL || "http://app:8090";
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const origin = typeof window !== "undefined" ? window.location?.origin : undefined;
  const envIsLocal = envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"));
  const originIsLocal = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"));

  if (envUrl && (!envIsLocal || originIsLocal)) {
    return envUrl;
  }
  if (origin) {
    return `${origin}/api`;
  }
  return envUrl || "http://app:8090";
}

const DEFAULT_FETCH_TIMEOUT_MS = 12000;
const DEFAULT_FETCH_MAX_RETRIES = 3;

export interface SeededLoadOptions {
  projectKey: string;
  entityType: string;
  seedValue?: number;
  limit?: number;
  method?: "select" | "shuffle" | "filter" | "distribute";
  filterKey?: string;
  filterValues?: string[];
  /** Request timeout in ms. Default 12000. */
  timeoutMs?: number;
  /** Max fetch retries. Default 3. */
  maxRetries?: number;
}

export async function fetchSeededSelection<T = any>(options: SeededLoadOptions): Promise<T[]> {
  const baseUrl = getApiBaseUrl();
  const seed = options.seedValue ?? 1;
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
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_FETCH_MAX_RETRIES;

  try {
    const resp = await fetchWithRetry(url, {
      method: "GET",
      timeoutMs,
      maxRetries,
      retryStatuses: [408, 429, 500, 502, 503, 504],
    });

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => "");
      throw new Error(`Seeded selection request failed: ${resp.status} - ${errorText.slice(0, 200)}`);
    }

    const rawJson = await resp.json().catch(() => null);
    if (rawJson == null || typeof rawJson !== "object") {
      console.warn("[automail/seeded-loader] Invalid JSON response");
      return [] as T[];
    }

    const data = (rawJson as { data?: unknown }).data;
    if (!Array.isArray(data)) {
      console.warn("[automail/seeded-loader] Response data is not an array", typeof data);
      return [] as T[];
    }

    return data as T[];
  } catch (error) {
    console.error("[automail/seeded-loader] Error in fetchSeededSelection:", error);
    throw error;
  }
}
