function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const origin = typeof window !== "undefined" ? window.location?.origin : undefined;
  const envIsLocal = envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"));
  const originIsLocal = origin && (origin.includes("localhost") || origin.includes("127.0.0.1"));

  let baseUrl: string;

  if (envUrl && (!(envIsLocal) || originIsLocal)) {
    baseUrl = envUrl;
  } else if (origin) {
    baseUrl = `${origin}/api`;
  } else {
    baseUrl = envUrl || "http://app:8090";
  }

  // Log the resolved API URL for debugging (only in browser)
  if (typeof window !== "undefined") {
    console.log(`[seeded-loader] Resolved API base URL: ${baseUrl} (envUrl: ${envUrl || 'none'}, origin: ${origin || 'none'})`);
  }

  return baseUrl;
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

  // Add timeout to prevent infinite hanging (10 seconds)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
  } catch (error: any) {
    clearTimeout(timeoutId);
    // If it's an abort (timeout), provide a clearer error message
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.error(`[seeded-loader] API request timed out after 10s for ${options.entityType} (seed=${seed})`);
      throw new Error(`API request timed out for ${options.entityType}. The backend service may be unavailable.`);
    }
    // Re-throw other errors
    throw error;
  }
}
