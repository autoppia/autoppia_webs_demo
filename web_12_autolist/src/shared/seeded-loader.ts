export interface SeededLoadOptions {
  projectKey: string;
  entityType: string;
  seedValue?: number;
  limit?: number;
  method?: "select" | "shuffle" | "filter" | "distribute";
  filterKey?: string;
  filterValues?: string[];
}

const coerceBool = (value: string | undefined | null): boolean => {
  const normalized = (value ?? "").toString().trim().toLowerCase();
  return ["true", "1", "yes", "y", "on"].includes(normalized);
};

export function isDbLoadModeEnabled(): boolean {
  return coerceBool(
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE ||
      process.env.ENABLE_DYNAMIC_V2_DB_MODE ||
      ""
  );
}

export function getApiBaseUrl(): string {
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

export async function fetchSeededSelection<T = unknown>(
  options: SeededLoadOptions
): Promise<T[]> {
  // Si el modo DB está deshabilitado, NO hacer ninguna llamada HTTP
  if (!isDbLoadModeEnabled()) {
    console.log(`[seeded-loader] DB mode disabled, skipping API call for ${options.entityType}`);
    return [] as T[];
  }

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

  if (options.filterKey) {
    params.set("filter_key", options.filterKey);
  }
  if (options.filterValues && options.filterValues.length > 0) {
    params.set("filter_values", options.filterValues.join(","));
  }

  try {
    const resp = await fetch(`${baseUrl}/datasets/load?${params.toString()}`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error(
        `[seeded-loader] Request failed ${resp.status}: ${await resp
          .text()
          .catch(() => "error")}`
      );
    }

    const payload = await resp.json();
    return (payload?.data ?? []) as T[];
  } catch (error) {
    // If it's a network error (fetch failed), throw a descriptive error
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const networkError = new Error(`Network error: Server at ${baseUrl} is not available. Please ensure the backend server is running.`);
      networkError.name = 'NetworkError';
      throw networkError;
    }
    // Re-throw other errors
    throw error;
  }
}
