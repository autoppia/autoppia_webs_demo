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
  console.log("[automail/seeded-loader] Fetching from:", url);
  console.log("[automail/seeded-loader] Options:", { projectKey: options.projectKey, entityType: options.entityType, seed, limit, method, filterKey: options.filterKey });

  try {
    const resp = await fetch(url, { method: "GET" });
    console.log("[automail/seeded-loader] Response status:", resp.status, resp.statusText);

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => "");
      console.error("[automail/seeded-loader] Request failed:", resp.status, errorText);
      throw new Error(`Seeded selection request failed: ${resp.status} - ${errorText.slice(0, 200)}`);
    }

    const json = await resp.json();
    console.log("[automail/seeded-loader] Response keys:", Object.keys(json));
    console.log("[automail/seeded-loader] Data length:", json?.data?.length, "isArray:", Array.isArray(json?.data));

    const result = (json?.data ?? []) as T[];
    console.log("[automail/seeded-loader] Returning", result.length, "items");
    return result;
  } catch (error) {
    console.error("[automail/seeded-loader] Error in fetchSeededSelection:", error);
    if (error instanceof Error) {
      console.error("[automail/seeded-loader] Error message:", error.message);
      console.error("[automail/seeded-loader] Error stack:", error.stack);
    }
    throw error;
  }
}
