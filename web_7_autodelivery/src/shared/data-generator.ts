/**
 * Universal Data Generation Utility for web_7_autodelivery
 * 
 * This utility provides consistent restaurant data generation for the web_7_autodelivery project.
 * It generates realistic restaurant data based on predefined types and configurations.
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
  'web_7_food_delivery': {
    projectName: 'Food Delivery Platform',
    dataType: 'restaurants',
    interfaceDefinition: `
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: string;
  rating: number;
  featured?: boolean;
  menu: MenuItem[];
  reviews: Review[];
  deliveryTime: string;
  pickupTime: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes?: MenuItemSize[];
  options?: MenuItemOption[];
  restaurantId?: string;
  restaurantName?: string;
}

export interface MenuItemSize {
  name: string;
  cal: number;
  priceMod: number;
}

export interface MenuItemOption {
  label: string;
}

export interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  feedback: string;
}`,
    examples: [
      {
        id: "1",
        name: "Pizza Palace",
        description: "Best wood-fired pizzas in town!",
        image: "https://source.unsplash.com/featured/?pizza&w=150&h=150&fit=crop&crop=entropy&auto=format&q=60",
        cuisine: "Italian",
        rating: 4.7,
        featured: true,
        menu: [
          {
            id: "1-1",
            name: "Margherita Pizza",
            description: "Classic pizza with tomato, mozzarella, and basil.",
            price: 10.99,
            image: "https://source.unsplash.com/featured/?margherita-pizza&w=150&h=150&fit=crop&crop=entropy&auto=format&q=60",
            sizes: [
              { name: "Small", cal: 230, priceMod: 0 },
              { name: "Medium", cal: 320, priceMod: 0.9 },
              { name: "Large", cal: 480, priceMod: 1.6 }
            ],
            options: [{ label: "No Basil" }, { label: "No Cheese" }],
            restaurantId: "1",
            restaurantName: "Pizza Palace"
          }
        ],
        reviews: [
          {
            author: "Marco R.",
            rating: 5,
            comment: "Pizza was amazing! Will order again.",
            date: "2025-06-02",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
          }
        ],
        deliveryTime: "40-55 min",
        pickupTime: "15 min"
      }
    ],
    categories: ["Italian", "Japanese", "Indian", "Mexican", "American"],
    namingRules: {
      restaurant_names: "Use authentic names that reflect the cuisine type",
      menu_items: "Use descriptive names that match the cuisine",
      reviews: "Use realistic customer names and authentic feedback"
    },
    additionalRequirements: `
Generate realistic restaurant data for a food delivery application. Ensure:
- Restaurant names and descriptions reflect the cuisine (e.g., 'Sushi World' for Japanese, 'Curry House' for Indian).
- Menu items are cuisine-specific (e.g., 'Margherita Pizza' for Italian, 'Beef Pho' for Vietnamese).
- Prices are realistic (e.g., $3-$25 for menu items, depending on cuisine and complexity).
- Images use Unsplash with specific query terms matching the restaurant or menu item name (e.g., 'pizza', 'sushi', 'taco'). Append '?w=150&h=150&fit=crop&crop=entropy&auto=format&q=60'.
- Ratings are between 4.0 and 5.0, with a 20% chance of 'featured' being true.
- Menu items have a 50% chance of including 1-3 sizes (Small, Medium, Large with realistic calories and price modifiers) and 1-3 options (e.g., 'No Cheese', 'Extra Spicy').
- Reviews have realistic comments, authors, and dates (within 30 days from 2025-07-09). Use randomuser.me for avatars.
- Delivery times are in the format 'X-Y min' (e.g., '30-45 min'), and pickup times are shorter (e.g., '10-20 min').
- Each restaurant has 2-5 menu items and 1-3 reviews.

ALSO GENERATE TESTIMONIALS:
- Create 3-5 customer testimonials about the food delivery service
- Use realistic customer names (first name + last initial, e.g., 'Sarah M.', 'Mike R.')
- Use randomuser.me for avatar URLs
- Write authentic feedback about delivery experience, food quality, app usability
- Keep testimonials positive and specific (mention delivery speed, food temperature, variety, etc.)

CRITICAL: Follow the exact data structure:
- Reviews must have: author (string), rating (number), comment (string), date (string in YYYY-MM-DD format), avatar (string URL)
- Menu items must have: id (string), name (string), description (string), price (number), image (string URL), sizes (array), options (array)
- Testimonials must have: id (string), name (string), avatar (string URL), feedback (string)
- Use realistic names and authentic reviews with proper ratings (4-5 stars)
- Include avatar URLs from randomuser.me for reviews and testimonials
- Use proper date format for reviews (YYYY-MM-DD)
`
  }
};

/**
 * Check if data generation is enabled via environment variables
 */
export function isDataGenerationEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_DATA_GENERATION === 'true';
  }
  return process.env.ENABLE_DATA_GENERATION === 'true';
}

/**
 * Get the API base URL for data generation
 */
export function getApiBaseUrl(): string {
  // In browser, prefer NEXT_PUBLIC_API_URL
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';
  }
  // In server, use API_URL
  return process.env.API_URL || 'http://localhost:8090';
}

/**
 * Generate project data using the universal API
 */
export async function generateProjectData(
  projectKey: string,
  count: number = 10,
  categories?: string[]
): Promise<DataGenerationResponse> {
  const startTime = Date.now();
  
  if (!isDataGenerationEnabled()) {
    return {
      success: false,
      data: [],
      count: 0,
      generationTime: 0,
      error: 'Data generation is not enabled'
    };
  }

  const config = PROJECT_CONFIGS[projectKey];
  if (!config) {
    throw new Error(`Project configuration not found for: ${projectKey}`);
  }

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/datasets/generate`, {
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
      }),
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
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}