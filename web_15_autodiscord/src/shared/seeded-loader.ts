const PROJECT_KEY = "web_15_autodiscord";

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  const origin = typeof window !== "undefined" ? window.location?.origin : undefined;
  if (envUrl && !envUrl.includes("localhost")) return envUrl;
  if (origin) return `${origin}/api`;
  return envUrl || "http://app:8090";
}

export interface SeededLoadOptions {
  projectKey: string;
  entityType: string;
  seedValue?: number;
  limit?: number;
  method?: "select" | "shuffle" | "filter" | "distribute";
}

function validateOptions(options: SeededLoadOptions): void {
  if (!options.projectKey || typeof options.projectKey !== "string") {
    throw new Error("SeededLoadOptions.projectKey is required");
  }
  if (!options.entityType || typeof options.entityType !== "string") {
    throw new Error("SeededLoadOptions.entityType is required");
  }
}

/**
 * Fetch a seeded slice of entity data from the webs_server API.
 * @throws Error on network failure, non-OK response, or invalid response body
 */
export async function fetchSeededSelection<T = unknown>(options: SeededLoadOptions): Promise<T[]> {
  validateOptions(options);
  const baseUrl = getApiBaseUrl();
  const seed = options.seedValue ?? 1;
  const limit = Math.min(Math.max(1, options.limit ?? 50), 500);
  const method = options.method ?? "select";
  const params = new URLSearchParams({
    project_key: options.projectKey,
    entity_type: options.entityType,
    seed_value: String(seed),
    limit: String(limit),
    method,
  });
  const url = `${baseUrl}/datasets/load?${params.toString()}`;

  let resp: Response;
  try {
    resp = await fetch(url, { method: "GET" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network request failed";
    throw new Error(`Seeded selection failed: ${message}`);
  }

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Seeded selection failed: ${resp.status}${body ? ` — ${body.slice(0, 100)}` : ""}`);
  }

  let json: { data?: unknown };
  try {
    json = await resp.json();
  } catch {
    throw new Error("Seeded selection failed: invalid JSON response");
  }

  const data = json?.data;
  if (!Array.isArray(data)) {
    throw new Error("Seeded selection failed: response data is not an array");
  }
  return data as T[];
}

export async function fetchDiscordEntities<T>(entityType: string, seedValue: number, limit: number): Promise<T[]> {
  return fetchSeededSelection<T>({
    projectKey: PROJECT_KEY,
    entityType,
    seedValue,
    limit,
  });
}
