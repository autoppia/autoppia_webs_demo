/**
 * Web8 Data Generation Utility
 * 
 * Generate realistic hotel/vacation rental data for the dashboard.
 * Uses AI-powered generation via backend API with strict rules.
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

// Project-specific configurations — WEB8 ONLY
export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {
  dashboard_hotels: {
    projectName: 'Web8 Hotel Dashboard',
    dataType: 'hotels',
    interfaceDefinition: `
export interface Amenity {
  icon: string;
  title: string;
  desc: string;
}

export interface Host {
  name: string;
  since: number; // years hosting
  avatar: string;
}

export interface Hotel {
  id: number;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  guests: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  datesFrom: string; // YYYY-MM-DD
  datesTo: string;   // YYYY-MM-DD
  price: number;
  host: Host;
  amenities: Amenity[];
}
    `.trim(),
    examples: [
      {
        id: 1,
        image: "https://source.unsplash.com/featured/?chalet,lake-tahoe,snow,winter-luxury?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
        title: "The Pinewood Chalet",
        location: "Lake Tahoe, USA",
        rating: 4.7,
        reviews: 124,
        guests: 4,
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        baths: 2,
        datesFrom: "2025-05-03",
        datesTo: "2025-07-15",
        price: 189,
        host: {
          name: "Emily",
          since: 3,
          avatar: "https://randomuser.me/api/portraits/women/65.jpg"
        },
        amenities: [
          {
            icon: "Laptop",
            title: "Dedicated workspace",
            desc: "A common area with wifi that's well-suited for working."
          },
          {
            icon: "Location",
            title: "Great location",
            desc: "Close to hiking trails and the lake shore."
          },
          {
            icon: "Check-in",
            title: "Easy check-in",
            desc: "Guests loved the seamless self-check-in process."
          }
        ]
      },
      {
        id: 2,
        image: "https://source.unsplash.com/featured/?beach-bungalow,goa,sunset,oceanfront?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
        title: "Sunset Beach Bungalow",
        location: "Goa, India",
        rating: 4.5,
        reviews: 98,
        guests: 2,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        datesFrom: "2025-05-03",
        datesTo: "2025-07-15",
        price: 104,
        host: {
          name: "Raj",
          since: 2,
          avatar: "https://randomuser.me/api/portraits/men/23.jpg"
        },
        amenities: [
          {
            icon: "WiFi",
            title: "WiFi included",
            desc: "Reliable high-speed internet connection."
          },
          {
            icon: "Beach",
            title: "Prime beach access",
            desc: "Step out directly onto the sandy beach."
          },
          {
            icon: "Guide",
            title: "Local guidebooks",
            desc: "Explore nearby restaurants and attractions."
          }
        ]
      }
    ],
    categories: [
      "Lake Tahoe, USA", "Goa, India", "Zermatt, Switzerland", "Kyoto, Japan", "Lisbon, Portugal",
      "Amsterdam, Netherlands", "Sedona, USA", "Melbourne, Australia", "Brooklyn, USA", "Banff, Canada",
      "Barcelona, Spain", "Gold Coast, Australia", "Edinburgh, UK", "Ubud, Bali", "Oslo, Norway",
      "Siena, Italy", "Reykjavík, Iceland", "Savannah, USA", "Toronto, Canada", "Burgundy, France",
      "Santorini, Greece", "Black Forest, Germany", "London, UK", "Prague, Czech Republic",
      "Vienna, Austria", "Paris, France", "Lake Como, Italy", "Phuket, Thailand", "Costa Rica",
      "Cartagena, Colombia", "Bergen, Norway", "Dubrovnik, Croatia", "Lake Bled, Slovenia",
      "Dubai, UAE", "Nashville, USA"
    ],
    namingRules: {
      id: "{number}",
      image: "https://source.unsplash.com/featured/?{title_snake_case},{location_city},luxury?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80"
    },
    additionalRequirements: `
Generate **realistic vacation rental listings** for a premium travel dashboard. **STRICT RULES**:

1. **Images**:
   - Use **only Unsplash** via source.unsplash.com
   - **Never use local paths** like "/images/hotel1.jpg"
   - Query must include: title (snake_case), city, and "luxury" or "boutique"
   - Always append: ?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80
   - Example: https://source.unsplash.com/featured/?alpine_ski_chalet,zermatt,luxury?...

2. **Host**:
   - Name: Realistic first name
   - since: 1–10 years
   - avatar: https://randomuser.me/api/portraits/[men|women]/X.jpg (X = 1–99)

3. **Stats**:
   - rating: 4.2 – 5.0 (1 decimal)
   - reviews: 30 – 350
   - price: $99 – $400/night
   - guests, bedrooms, beds, baths: logically consistent

4. **Dates**:
   - 2025 only
   - From: March 1 – July 1
   - To: From + 60 to 120 days
   - Format: YYYY-MM-DD

5. **Amenities**: Exactly 3 per listing
   - icon: relevant emoji
   - title: short & clear
   - desc: 8–15 words

6. **Title**: Unique, evocative, brand-like
   - e.g., "Alpine Ski Chalet", "Oceanfront Zen Villa", "Rustic Tuscan Farmhouse"

7. **Location**: Use full "City, Country" from categories list
`.trim()
  }
};

/**
 * Generate hotel data for Web8 dashboard
 */
export async function generateProjectData(
  projectKey: string = 'dashboard_hotels',
  count: number = 10,
  locations?: string[]
): Promise<DataGenerationResponse> {
  const config = PROJECT_CONFIGS[projectKey];
  if (!config) {
    return {
      success: false,
      data: [],
      count: 0,
      generationTime: 0,
      error: `Project not found: ${projectKey}. Use 'dashboard_hotels'.`
    };
  }

  const startTime = Date.now();

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/datasets/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interface_definition: config.interfaceDefinition,
        examples: config.examples,
        count: Math.max(1, Math.min(200, count)),
        categories: locations || config.categories,
        additional_requirements: config.additionalRequirements,
        naming_rules: config.namingRules,
        project_key: projectKey,
        entity_type: config.dataType,
        save_to_db: true,
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const generationTime = (Date.now() - startTime) / 1000;

    return {
      success: true,
      data: result.generated_data || [],
      count: result.count || result.generated_data?.length || 0,
      generationTime,
    };
  } catch (error) {
    const generationTime = (Date.now() - startTime) / 1000;
    return {
      success: false,
      data: [],
      count: 0,
      generationTime,
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

/**
 * Check if data generation is enabled (via env)
 */
export function isDataGenerationEnabled(): boolean {
  const val = (
    process.env.NEXT_PUBLIC_DATA_GENERATION ??
    process.env.NEXT_ENABLE_DATA_GENERATION ??
    process.env.ENABLE_DATA_GENERATION ??
    ''
  ).toString().toLowerCase();

  return ['true', '1', 'yes', 'on'].includes(val);
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'http://localhost:8090'
  );
}