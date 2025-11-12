/**
 * Web 9 – LinkedIn Lite Data Generation Utility
 * 
 * Generates realistic Users, Posts, and Jobs for the LinkedIn Lite demo.
 * Calls the same `/datasets/generate` endpoint you already use.
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
  categories?: string[];
  namingRules: Record<string, any>;
  additionalRequirements: string;
}

// ---------------------------------------------------------------------
//  PROJECT CONFIGS – ONLY LinkedIn Lite (Web 9)
// ---------------------------------------------------------------------

export const PROJECT_CONFIGS: Record<string, ProjectDataConfig> = {

  // -------------------------------------------------
  //  1. Users
  // -------------------------------------------------
  linkedin_users: {
    projectName: 'LinkedIn Lite – Users',
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
    namingRules: {
      username: "{first_name_lower}.{last_name_lower}",
      avatar: "https://randomuser.me/api/portraits/{gender}/{number}.jpg",
      "experience.logo": "https://logo.clearbit.com/{company_domain}"
    },
    additionalRequirements:
      "Generate diverse, realistic LinkedIn user profiles. Use real-looking full names. Titles should span engineering, design, product, marketing, HR, etc. Include 1–3 experience entries per user. Avatars from randomuser.me, company logos from clearbit.com. Bios: 1–2 sentences. About: 2–4 paragraphs.",
  },

  // -------------------------------------------------
  //  2. Posts
  // -------------------------------------------------
  linkedin_posts: {
    projectName: 'LinkedIn Lite – Posts',
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
    namingRules: {
      id: "p{number}",
      "comments.id": "c{number}",
      image: "https://images.unsplash.com/photo-{random_id}?w=720&h=420&fit=crop&crop=entropy&auto=format&q=80"
    },
    additionalRequirements:
      "Generate realistic LinkedIn posts (1–3 sentences). Randomly add 0–3 comments from other users (reference existing users). 30% of posts should include an image – use Unsplash with a semantic query (e.g., 'remote work', 'coding laptop', 'team meeting'). Append '?w=720&h=420&fit=crop&crop=entropy&auto=format&q=80'. Timestamps within the last 7 days, evenly spread.",
  },

  // -------------------------------------------------
  //  3. Jobs
  // -------------------------------------------------
  linkedin_jobs: {
    projectName: 'LinkedIn Lite – Jobs',
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
    namingRules: {
      id: "j{number}",
      logo: "https://logo.clearbit.com/{company_domain}"
    },
    additionalRequirements:
      "Generate realistic job listings. Vary titles, companies, locations (mix remote/in-office), salary ranges, and experience levels. Include 4–7 requirements and 3–6 benefits. postedDate within the last 30 days. applicationCount between 10–300. Use clearbit.com for company logos.",
  },
};

/**
 * Generate data for a specific Web 9 project
 */
export async function generateProjectData(
  projectKey: 'linkedin_users' | 'linkedin_posts' | 'linkedin_jobs',
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interface_definition: config.interfaceDefinition,
        examples: config.examples,
        count: Math.max(1, Math.min(200, count)),
        categories: categories || config.categories || [],
        additional_requirements: config.additionalRequirements,
        naming_rules: config.namingRules,
        project_key: projectKey,
        entity_type: config.dataType,
        save_to_db: true,
      })
    });

    if (!response.ok) throw new Error(`API request failed: ${response.status}`);

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

/**
 * Check if data generation is enabled
 */
export function isDataGenerationEnabled(): boolean {
  const raw = (
    process.env.NEXT_PUBLIC_DATA_GENERATION ??
    process.env.NEXT_ENABLE_DATA_GENERATION ??
    process.env.ENABLE_DATA_GENERATION ??
    ''
  ).toString().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(raw);
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:8090';
}

// Export interfaces for use in other files
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
