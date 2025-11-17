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
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:8080"
  );
}

export async function fetchSeededSelection<T = unknown>(
  options: SeededLoadOptions
): Promise<T[]> {
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
}
