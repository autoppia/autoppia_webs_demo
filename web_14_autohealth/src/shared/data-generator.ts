export interface DataGenerationResponse<T = unknown> {
  success: boolean;
  data: T[];
  count: number;
  generationTime: number;
  error?: string;
}

export async function generateProjectData<T = unknown>(
  projectKey: string,
  count: number = 10,
  entityType: string,
  interfaceDefinition: string,
  examples: unknown[],
  additionalRequirements: string,
  categories?: string[]
): Promise<DataGenerationResponse<T>> {
  const start = Date.now();
  try {
    const baseUrl = getApiBaseUrl();
    const resp = await fetch(`${baseUrl}/datasets/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interface_definition: interfaceDefinition,
        examples,
        count: Math.max(1, Math.min(200, count)),
        categories,
        additional_requirements: additionalRequirements,
        naming_rules: {},
        project_key: projectKey,
        entity_type: entityType,
        save_to_db: true,
      }),
    });
    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const json = await resp.json();
    return {
      success: true,
      data: (json.generated_data || []) as T[],
      count: json.count || (json.generated_data?.length ?? 0),
      generationTime: (Date.now() - start) / 1000,
    };
  } catch (e) {
    return {
      success: false,
      data: [],
      count: 0,
      generationTime: (Date.now() - start) / 1000,
      error: e instanceof Error ? e.message : 'Generation failed',
    };
  }
}

export function isDataGenerationEnabled(): boolean {
  const raw = (
    process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE ||
    process.env.ENABLE_DYNAMIC_V2_AI_GENERATE ||
    ''
  ).toString().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(raw);
}

export function getApiBaseUrl(): string {
  // In browser, NEXT_PUBLIC_API_URL is available, API_URL is not
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8090';
}

