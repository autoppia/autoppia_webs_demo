/**
 * Universal Data Generation Utility
 * 
 * This utility provides consistent data generation across all web projects.
 * It can generate data for different project types (Django, Next.js, etc.)
 * and handle various data structures.
 */


export interface DataGenerationResponse {
  success: boolean;
  data: any[];
  count: number;
  generationTime: number;
  error?: string;
}

export interface ProjectDataConfig {
  projectName: string;
  dataType: string;
  interfaceDefinition: string;
  examples: any[];
  categories: string[];
  namingRules: Record<string, any>;
  additionalRequirements: string;
}

// Project-specific configurations
export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {
  'web_3_autozone': {
    projectName: 'AutoZone E-commerce',
    dataType: 'products',
    interfaceDefinition: `
export interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  description?: string;
  category?: string;
  rating?: number;
  brand?: string;
  inStock?: boolean;
  color?: string;
  size?: string;
  dimensions?: {
    depth?: string;
    length?: string;
    width?: string;
  };
  careInstructions?: string;
}
    `,
    examples: [
      {
        id: "kitchen-1",
        title: "Espresso Machine",
        price: "$160.00",
        image: "https://source.unsplash.com/featured/?espresso-machine",
        description: "Professional-grade espresso machine with steam wand and programmable settings.",
        category: "Kitchen",
        rating: 4.5,
        brand: "BrewMaster",
        inStock: true
      }
    ],
    categories: ["Kitchen", "Electronics", "Home", "Fitness", "Technology"],
    namingRules: {
      id: "{category}-{number}",
      image: "https://source.unsplash.com/featured/?{name_snake_case}"
    },
      additionalRequirements: "Generate realistic e-commerce product data with proper pricing, descriptions, and categories. For the image field: use Unsplash only and ensure the photo semantically matches the title/brand/category (no placeholders). Prefer specific query terms like 'stainless-steel cookware set', 'gaming-laptop', 'yoga-mat'. You may also return a direct images.unsplash.com URL. Append size/quality params '?w=150&h=150&fit=crop&crop=entropy&auto=format&q=60'. Never return local paths or dummy names like 'image.png'."
  }
};

/**
 * Generate data for a specific project
 */
export async function generateProjectData(
  projectKey: string,
  count: number = 10,
  categories?: string[]
): Promise<DataGenerationResponse> {
  const config = PROJECT_CONFIGS[projectKey];
  if (!config) {
    return {
      success: false,
      data: [],
      count: 0,
      generationTime: 0,
      error: `Project configuration not found for: ${projectKey}`
    };
  }

  const startTime = Date.now();
  
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/datasets/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interface_definition: config.interfaceDefinition,
        examples: config.examples,
        count: Math.max(1, Math.min(200, count)),
        categories: categories || config.categories,
        additional_requirements: config.additionalRequirements,
        naming_rules: config.namingRules,
        project_key: projectKey,
        entity_type: config.dataType,
        save_to_db: true,
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const generationTime = (Date.now() - startTime) / 1000;

    return {
      success: true,
      data: result.generated_data,
      count: result.count,
      generationTime,
    };
  } catch (error) {
    const generationTime = (Date.now() - startTime) / 1000;
    return {
      success: false,
      data: [],
      count: 0,
      generationTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}


/**
 * Check if data generation is enabled
 */
export function isDataGenerationEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_DATA_GENERATION ??
               process.env.NEXT_ENABLE_DATA_GENERATION ??
               process.env.ENABLE_DATA_GENERATION ??
               '').toString().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 
         process.env.API_URL || 
         'http://localhost:8090';
}

