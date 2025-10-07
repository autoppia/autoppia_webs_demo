/**
 * Universal Data Generation Utility
 * 
 * This utility provides consistent data generation across all web projects.
 * It can generate data for different project types (Django, Next.js, etc.)
 * and handle various data structures.
 */

export interface DataGenerationConfig {
  projectType: 'django' | 'nextjs' | 'react';
  dataType: 'products' | 'movies' | 'books' | 'matters' | 'files' | 'clients' | 'events';
  interfaceDefinition: string;
  examples: any[];
  count: number;
  categories?: string[];
  additionalRequirements?: string;
  namingRules?: Record<string, any>;
}

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
  'web_1_demo_movies': {
    projectName: 'Movies Demo',
    dataType: 'movies',
    interfaceDefinition: `
export interface Movie {
  id: string;
  name: string;
  desc: string;
  year: number;
  img: string;
  director: string;
  cast: string;
  duration: number;
  trailer_url: string;
  rating: number;
  genres: string[];
}
    `,
    examples: [
      {
        id: "movie-1",
        name: "The Dark Knight",
        desc: "A crime thriller about Batman's battle with the Joker.",
        year: 2008,
        img: "/media/gallery/dark_knight.jpg",
        director: "Christopher Nolan",
        cast: "Christian Bale, Heath Ledger, Aaron Eckhart",
        duration: 152,
        trailer_url: "https://youtube.com/watch?v=EXeTwQWrcwY",
        rating: 4.5,
        genres: ["Action", "Crime", "Drama"]
      }
    ],
    categories: ["Action", "Drama", "Comedy", "Thriller", "Sci-Fi", "Horror"],
    namingRules: {
      id: "movie-{number}",
      img: "/media/gallery/{name_snake_case}.jpg"
    },
    additionalRequirements: "Generate realistic movie data with proper genres, directors, and cast information."
  },

  'web_2_demo_books': {
    projectName: 'Books Demo',
    dataType: 'books',
    interfaceDefinition: `
export interface Book {
  id: string;
  name: string;
  desc: string;
  year: number;
  img: string;
  director: string;
  duration: number;
  trailer_url: string;
  rating: number;
  price: number;
  genres: string[];
}
    `,
    examples: [
      {
        id: "book-1",
        name: "The Great Gatsby",
        desc: "A classic American novel about the Jazz Age.",
        year: 1925,
        img: "/media/gallery/great_gatsby.jpg",
        director: "F. Scott Fitzgerald",
        duration: 180,
        trailer_url: "https://youtube.com/watch?v=example",
        rating: 4.8,
        price: 12.99,
        genres: ["Fiction", "Classic", "Literature"]
      }
    ],
    categories: ["Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", "Biography"],
    namingRules: {
      id: "book-{number}",
      img: "/media/gallery/{name_snake_case}.jpg"
    },
    additionalRequirements: "Generate realistic book data with proper genres, authors, and pricing."
  },

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
  },

  'web_5_autocrm': {
    projectName: 'AutoCRM Legal',
    dataType: 'matters',
    interfaceDefinition: `
export interface Matter {
  id: string;
  name: string;
  status: string;
  client: string;
  updated: string;
}
    `,
    examples: [
      {
        id: "MAT-0012",
        name: "Estate Planning",
        status: "Active",
        client: "Smith & Co.",
        updated: "Today"
      }
    ],
    categories: ["Estate Planning", "Contract Review", "IP Filing", "M&A Advice", "Trademark Registration"],
    namingRules: {
      id: "MAT-{number:04d}"
    },
    additionalRequirements: "Generate realistic legal matter data with proper statuses and client information."
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://app:8000'}/datasets/generate`, {
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
 * Get available project configurations
 */
export function getAvailableProjects(): string[] {
  return Object.keys(PROJECT_CONFIGS);
}

/**
 * Get project configuration
 */
export function getProjectConfig(projectKey: string): ProjectDataConfig | null {
  return PROJECT_CONFIGS[projectKey] || null;
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
         'http://app:8000';
}

/**
 * Generate data with fallback to original data
 */
export async function generateDataWithFallback<T>(
  projectKey: string,
  originalData: T[],
  count: number = 10,
  categories?: string[]
): Promise<T[]> {
  if (!isDataGenerationEnabled()) {
    return originalData;
  }

  try {
    const result = await generateProjectData(projectKey, count, categories);
    if (result.success && result.data.length > 0) {
      return result.data as T[];
    }
  } catch (error) {
    console.warn('Data generation failed, using original data:', error);
  }

  return originalData;
}

/**
 * Replace data in a file (for build-time generation)
 */
export async function replaceDataInFile(
  filePath: string,
  projectKey: string,
  count: number = 10,
  categories?: string[]
): Promise<boolean> {
  try {
    const result = await generateProjectData(projectKey, count, categories);
    if (result.success) {
      // This would be implemented based on the specific file type
      // For now, we'll return success
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to replace data in file:', error);
    return false;
  }
}

export default {
  generateProjectData,
  getAvailableProjects,
  getProjectConfig,
  isDataGenerationEnabled,
  getApiBaseUrl,
  generateDataWithFallback,
  replaceDataInFile
};
