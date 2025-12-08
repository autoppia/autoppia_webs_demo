function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
  }
  return process.env.API_URL || "http://app:8080";
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

export function isDbLoadModeEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE || process.env.ENABLE_DYNAMIC_V2_DB_MODE || "").toString().toLowerCase();
  return raw === "true";
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
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    throw new Error(`Seeded selection request failed: ${resp.status}`);
  }
  const json = await resp.json();
  
  // Check if API returned an error in the response body (common pattern: {detail: "error message"})
  if (json?.detail && typeof json.detail === 'string' && !json?.data) {
    throw new Error(`API error: ${json.detail}`);
  }
  
  // Check if data is missing or empty
  if (!json?.data || !Array.isArray(json.data)) {
    const errorMsg = json?.detail || `No data returned from API for ${options.entityType}`;
    throw new Error(errorMsg);
  }
  
  // Return data even if empty array - let caller decide if empty is acceptable
  return json.data as T[];
}


export async function fetchPoolInfo(projectKey: string, entityType: string): Promise<{ pool_size: number } | null> {
  // In browser, avoid calling default :8090 when no explicit public API URL is set
  if (typeof window !== 'undefined') {
    const pubUrl = (process.env.NEXT_PUBLIC_API_URL || '').toString();
    if (!pubUrl) return null;
  }
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/datasets/pool/info?project_key=${encodeURIComponent(projectKey)}&entity_type=${encodeURIComponent(entityType)}`;
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


