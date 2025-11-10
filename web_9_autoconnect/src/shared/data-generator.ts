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
  },

  // -------------------------------------------------
  //  Web 9 - Autoconnect (LinkedIn Lite) Configurations
  // -------------------------------------------------
  'web_9_autoconnect_users': {
    projectName: 'Autoconnect - Users',
    dataType: 'users',
    interfaceDefinition: `
export interface Experience {
  title: string;
  company: string;
  logo: string;
  duration: string;
  location: string;
  description: string;
}
export interface User {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  title: string;
  about?: string;
  experience?: Experience[];
}
    `.trim(),
    examples: [
      {
        username: "johndoe",
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Software Engineer passionate about building products.",
        title: "Software Engineer",
        about: "Hello, I'm John! I specialize in frontend engineering and building delightful web experiences for users. I love JavaScript, React, and solving interesting UI problems. Always looking for new tech to learn!\n\nBS in Computer Science from MIT, 2017.",
        experience: [
          {
            title: "Software Engineer",
            company: "Google",
            logo: "https://logo.clearbit.com/google.com",
            duration: "Sep 2018 - Present • 5 yrs 9 mos",
            location: "Mountain View, California",
            description: "Working on scalable dashboards for Google Cloud platform. Building performant UIs in React, collaborating with cross-functional teams."
          }
        ]
      }
    ],
    categories: ["Technology", "Design", "Marketing", "Sales", "HR", "Finance", "Healthcare", "Education"],
    namingRules: {
      username: "{first_name_lower}.{last_name_lower}",
      avatar: "https://randomuser.me/api/portraits/{gender}/{number}.jpg",
      "experience.logo": "https://logo.clearbit.com/{company_domain}"
    },
    additionalRequirements: "Generate diverse, realistic LinkedIn user profiles. Use real-looking full names. Titles should span engineering, design, product, marketing, HR, etc. Include 1–3 experience entries per user. Avatars from randomuser.me, company logos from clearbit.com. Bios: 1–2 sentences. About: 2–4 paragraphs."
  },

  'web_9_autoconnect_posts': {
    projectName: 'Autoconnect - Posts',
    dataType: 'posts',
    interfaceDefinition: `
export interface PostComment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}
export interface Post {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  comments: PostComment[];
  image?: string;
}
    `.trim(),
    examples: [
      {
        id: "1",
        user: {
          username: "janedoe",
          name: "Jane Doe",
          avatar: "https://randomuser.me/api/portraits/women/68.jpg",
          bio: "Product Manager & startup enthusiast.",
          title: "Product Manager"
        },
        content: "Excited to join LinkedIn Lite!",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        likes: 3,
        liked: false,
        comments: [
          {
            id: "c1",
            user: {
              username: "johndoe",
              name: "John Doe",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              bio: "Software Engineer passionate about building products.",
              title: "Software Engineer"
            },
            text: "Welcome aboard, Jane!",
            timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
          }
        ],
        image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=720&h=420&fit=crop&crop=entropy&auto=format&q=80"
      }
    ],
    categories: ["Technology", "Career", "Networking", "Industry News", "Personal", "Professional Development"],
    namingRules: {
      id: "p{number}",
      "comments.id": "c{number}",
      image: "https://images.unsplash.com/photo-{random_id}?w=720&h=420&fit=crop&crop=entropy&auto=format&q=80"
    },
    additionalRequirements: "Generate realistic LinkedIn posts (1–3 sentences). Randomly add 0–3 comments from other users (reference existing users). 40% of posts should include an image – use Unsplash with semantic queries related to the post content (e.g., 'remote work office', 'coding laptop setup', 'team meeting collaboration', 'business handshake', 'technology innovation', 'professional networking'). Always append '?w=720&h=420&fit=crop&crop=entropy&auto=format&q=80' to image URLs. Timestamps within the last 7 days, evenly spread. Make images contextually relevant to the post content."
  },

  'web_9_autoconnect_jobs': {
    projectName: 'Autoconnect - Jobs',
    dataType: 'jobs',
    interfaceDefinition: `
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  logo: string;
  salary?: string;
  type?: string;
  experience?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  postedDate?: string;
  applicationCount?: number;
  companySize?: string;
  industry?: string;
  remote?: boolean;
}
    `.trim(),
    examples: [
      {
        id: "j1",
        title: "Senior Frontend Developer",
        company: "Tech Innovations",
        location: "Remote",
        logo: "https://logo.clearbit.com/techinnovations.com",
        salary: "$120,000 - $150,000",
        type: "Full-time",
        experience: "5+ years",
        description: "We're looking for a Senior Frontend Developer to join our growing team. You'll be responsible for building scalable, performant web applications using React, TypeScript, and modern frontend technologies.",
        requirements: [
          "5+ years of experience with React, TypeScript, and modern JavaScript",
          "Strong understanding of CSS, HTML, and responsive design"
        ],
        benefits: [
          "Competitive salary and equity package",
          "Flexible remote work policy"
        ],
        postedDate: "2024-01-15",
        applicationCount: 47,
        companySize: "50-100 employees",
        industry: "Technology",
        remote: true
      }
    ],
    categories: ["Technology", "Design", "Marketing", "Sales", "Finance", "Healthcare", "Education", "Remote"],
    namingRules: {
      id: "j{number}",
      logo: "https://logo.clearbit.com/{company_domain}"
    },
    additionalRequirements: "Generate realistic job listings. Vary titles, companies, locations (mix remote/in-office), salary ranges, and experience levels. Include 4–7 requirements and 3–6 benefits. postedDate within the last 30 days. applicationCount between 10–300. Use clearbit.com for company logos."
  },

  'web_9_autoconnect_recommendations': {
    projectName: 'Autoconnect - Recommendations',
    dataType: 'recommendations',
    interfaceDefinition: `
export interface Recommendation {
  id: string;
  type: 'user' | 'job' | 'company' | 'skill' | 'event';
  title: string;
  description: string;
  reason: string;
  relevanceScore: number;
  category: string;
  image?: string;
  metadata?: {
    location?: string;
    company?: string;
    salary?: string;
    experience?: string;
    skills?: string[];
    industry?: string;
  };
}
    `.trim(),
    examples: [
      {
        id: "r1",
        type: "user",
        title: "Sarah Chen - UX Designer",
        description: "Senior UX Designer at Google with 8+ years experience in mobile design",
        reason: "Based on your interest in design and mobile development",
        relevanceScore: 0.92,
        category: "Design",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face&auto=format&q=80",
        metadata: {
          location: "San Francisco, CA",
          company: "Google",
          skills: ["Figma", "User Research", "Mobile Design"]
        }
      },
      {
        id: "r2",
        type: "job",
        title: "Senior Product Manager",
        description: "Lead product strategy for a fast-growing fintech startup",
        reason: "Matches your product management background and fintech interest",
        relevanceScore: 0.88,
        category: "Product Management",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=300&fit=crop&crop=entropy&auto=format&q=80",
        metadata: {
          location: "New York, NY",
          company: "FinTech Startup",
          salary: "$140,000 - $180,000",
          experience: "5+ years"
        }
      }
    ],
    categories: ["Technology", "Design", "Product Management", "Marketing", "Sales", "Finance", "Healthcare", "Education", "Startups", "Remote Work"],
    namingRules: {
      id: "r{number}",
      image: "https://images.unsplash.com/photo-{random_id}?w=300&h=300&fit=crop&crop=entropy&auto=format&q=80"
    },
    additionalRequirements: "Generate personalized recommendations for LinkedIn users. Include user recommendations (people to connect with), job recommendations (based on profile and interests), company recommendations (companies to follow), skill recommendations (skills to learn), and event recommendations (professional events). Use relevant Unsplash images for each recommendation type. Relevance scores should be between 0.7-0.95. Include diverse categories and make recommendations feel personalized and actionable."
  }
};

/**
 * Generate data for a specific project
 */
export async function generateProjectData(
  projectKey: string,
  count: number = 10,
  categories?: string[],
  saveToDb: boolean = false
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
        save_to_db: saveToDb,
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
  const raw = (process.env.NEXT_PUBLIC_ENABLE_DATA_GENERATION ??
               process.env.NEXT_PUBLIC_DATA_GENERATION ??
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

