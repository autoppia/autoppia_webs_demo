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
        image: "/images/homepage_categories/coffee_machine.jpg",
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
      image: "/images/homepage_categories/{name_snake_case}.jpg"
    },
    additionalRequirements: "Generate realistic e-commerce product data with proper pricing, descriptions, and categories."
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/datasets/generate`, {
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
        naming_rules: config.namingRules
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
  return process.env.NEXT_PUBLIC_DATA_GENERATION === 'true' || 
         process.env.ENABLE_DATA_GENERATION === 'true';
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 
         process.env.API_URL || 
         'http://localhost:8000';
}


export default {
  generateProjectData,
  isDataGenerationEnabled,
  getApiBaseUrl
};
