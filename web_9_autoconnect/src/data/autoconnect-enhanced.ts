import { isDataGenerationEnabled, generateProjectData } from "@/shared/data-generator";
import { isDbLoadModeEnabled, fetchSeededSelection } from "@/shared/seeded-loader";
import type { User, Post, Job, Recommendation } from "@/library/dataset";

/**
 * Initialize users data - either from database, AI generation, or fallback to static data
 */
export async function initializeUsers(): Promise<User[]> {
  // Check if database mode is enabled and we're in the browser (not during build)
  if (isDbLoadModeEnabled() && typeof window !== "undefined") {
    console.log('🗄️ Database mode enabled, loading users from database...');
    try {
      const dbData = await fetchSeededSelection({
        projectKey: "web_9_autoconnect_users",
        entityType: "users",
        seedValue: 1, // Use default seed when no seed is provided
        limit: 50
      });
      
      if (dbData && dbData.length > 0) {
        console.log(`✅ Loaded ${dbData.length} users from database`);
        return dbData as User[];
      } else {
        console.log('⚠️ No data found in database, falling back to static data');
      }
    } catch (error) {
      console.warn('⚠️ Database load failed, falling back to static data:', error);
    }
  }

  // If DB mode is enabled but we're server-side (during build), use static data
  if (isDbLoadModeEnabled() && typeof window === "undefined") {
    console.log('📊 DB mode enabled but running server-side, using static user data');
    return getStaticUsers();
  }

  // Check if data generation is enabled
  if (!isDataGenerationEnabled()) {
    console.log('📊 Data generation disabled, using static user data');
    return getStaticUsers();
  }

  // Check for cached data first
  const cacheKey = "autoconnect_generated_users_v1";
  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  
  if (cached) {
    try {
      const parsedData = JSON.parse(cached);
      console.log('💾 Using cached user data:', parsedData.length, 'users');
      return parsedData;
    } catch (error) {
      console.warn('⚠️ Failed to parse cached data, regenerating...', error);
    }
  }

  console.log('🚀 Generating users for Autoconnect...');
  
  try {
    const result = await generateProjectData("web_9_autoconnect_users", 30, undefined, true); // Always save to DB when generating
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ Generated ${result.data.length} users and saved to database`);
      
      // Cache the results
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        console.log('💾 Cached results in localStorage (autoconnect_generated_users_v1)');
      }
      
      return result.data;
    } else {
      console.warn('⚠️ Data generation failed, falling back to static data:', result.error);
      return getStaticUsers();
    }
  } catch (error) {
    console.error('❌ Data generation error, falling back to static data:', error);
    return getStaticUsers();
  }
}

/**
 * Initialize posts data - either from database, AI generation, or fallback to static data
 */
export async function initializePosts(): Promise<Post[]> {
  // Check if database mode is enabled and we're in the browser (not during build)
  if (isDbLoadModeEnabled() && typeof window !== "undefined") {
    console.log('🗄️ Database mode enabled, loading posts from database...');
    try {
      const dbData = await fetchSeededSelection({
        projectKey: "web_9_autoconnect_posts",
        entityType: "posts",
        seedValue: 1,
        limit: 50
      });
      
      if (dbData && dbData.length > 0) {
        console.log(`✅ Loaded ${dbData.length} posts from database`);
        return dbData as Post[];
      } else {
        console.log('⚠️ No data found in database, falling back to static data');
      }
    } catch (error) {
      console.warn('⚠️ Database load failed, falling back to static data:', error);
    }
  }

  // If DB mode is enabled but we're server-side (during build), use static data
  if (isDbLoadModeEnabled() && typeof window === "undefined") {
    console.log('📊 DB mode enabled but running server-side, using static post data');
    return getStaticPosts();
  }

  // Check if data generation is enabled
  if (!isDataGenerationEnabled()) {
    console.log('📊 Data generation disabled, using static post data');
    return getStaticPosts();
  }

  // Check for cached data first
  const cacheKey = "autoconnect_generated_posts_v1";
  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  
  if (cached) {
    try {
      const parsedData = JSON.parse(cached);
      console.log('💾 Using cached post data:', parsedData.length, 'posts');
      return parsedData;
    } catch (error) {
      console.warn('⚠️ Failed to parse cached data, regenerating...', error);
    }
  }

  console.log('🚀 Generating posts for Autoconnect...');
  
  try {
    const result = await generateProjectData("web_9_autoconnect_posts", 20, undefined, true); // Always save to DB when generating
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ Generated ${result.data.length} posts and saved to database`);
      
      // Cache the results
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        console.log('💾 Cached results in localStorage (autoconnect_generated_posts_v1)');
      }
      
      return result.data;
    } else {
      console.warn('⚠️ Data generation failed, falling back to static data:', result.error);
      return getStaticPosts();
    }
  } catch (error) {
    console.error('❌ Data generation error, falling back to static data:', error);
    return getStaticPosts();
  }
}

/**
 * Initialize jobs data - either from database, AI generation, or fallback to static data
 */
export async function initializeJobs(): Promise<Job[]> {
  // Check if database mode is enabled and we're in the browser (not during build)
  if (isDbLoadModeEnabled() && typeof window !== "undefined") {
    console.log('🗄️ Database mode enabled, loading jobs from database...');
    try {
      const dbData = await fetchSeededSelection({
        projectKey: "web_9_autoconnect_jobs",
        entityType: "jobs",
        seedValue: 1,
        limit: 50
      });
      
      if (dbData && dbData.length > 0) {
        console.log(`✅ Loaded ${dbData.length} jobs from database`);
        return dbData as Job[];
      } else {
        console.log('⚠️ No data found in database, falling back to static data');
      }
    } catch (error) {
      console.warn('⚠️ Database load failed, falling back to static data:', error);
    }
  }

  // If DB mode is enabled but we're server-side (during build), use static data
  if (isDbLoadModeEnabled() && typeof window === "undefined") {
    console.log('📊 DB mode enabled but running server-side, using static job data');
    return getStaticJobs();
  }

  // Check if data generation is enabled
  if (!isDataGenerationEnabled()) {
    console.log('📊 Data generation disabled, using static job data');
    return getStaticJobs();
  }

  // Check for cached data first
  const cacheKey = "autoconnect_generated_jobs_v1";
  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  
  if (cached) {
    try {
      const parsedData = JSON.parse(cached);
      console.log('💾 Using cached job data:', parsedData.length, 'jobs');
      return parsedData;
    } catch (error) {
      console.warn('⚠️ Failed to parse cached data, regenerating...', error);
    }
  }

  console.log('🚀 Generating jobs for Autoconnect...');
  
  try {
    const result = await generateProjectData("web_9_autoconnect_jobs", 25, undefined, true); // Always save to DB when generating
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ Generated ${result.data.length} jobs and saved to database`);
      
      // Cache the results
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        console.log('💾 Cached results in localStorage (autoconnect_generated_jobs_v1)');
      }
      
      return result.data;
    } else {
      console.warn('⚠️ Data generation failed, falling back to static data:', result.error);
      return getStaticJobs();
    }
  } catch (error) {
    console.error('❌ Data generation error, falling back to static data:', error);
    return getStaticJobs();
  }
}

/**
 * Clear all cached data
 */
export function clearAutoconnectCache(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("autoconnect_generated_users_v1");
    localStorage.removeItem("autoconnect_generated_posts_v1");
    localStorage.removeItem("autoconnect_generated_jobs_v1");
    console.log('🗑️ Cleared autoconnect cache');
  }
}

// Static data fallbacks
function getStaticUsers(): User[] {
  return [
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
    },
    {
      username: "janedoe",
      name: "Jane Doe",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      bio: "Product Manager & startup enthusiast.",
      title: "Product Manager",
      about: "I'm passionate about building products that users love. I have experience in both B2B and B2C products, with a focus on user research and data-driven decision making.\n\nMBA from Stanford, 2019.",
      experience: [
        {
          title: "Senior Product Manager",
          company: "Meta",
          logo: "https://logo.clearbit.com/meta.com",
          duration: "Jan 2020 - Present • 4 yrs 1 mo",
          location: "Menlo Park, California",
          description: "Leading product strategy for social commerce features. Working with engineering, design, and data science teams to deliver user-centric solutions."
        }
      ]
    },
    {
      username: "mikejohnson",
      name: "Mike Johnson",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      bio: "UX Designer focused on creating intuitive experiences.",
      title: "Senior UX Designer",
      about: "I design digital experiences that are both beautiful and functional. I believe in user-centered design and enjoy solving complex problems through research and iteration.\n\nMFA in Design from Art Center, 2018.",
      experience: [
        {
          title: "Senior UX Designer",
          company: "Apple",
          logo: "https://logo.clearbit.com/apple.com",
          duration: "Mar 2019 - Present • 4 yrs 11 mos",
          location: "Cupertino, California",
          description: "Designing user interfaces for iOS and macOS applications. Collaborating with product managers and engineers to create cohesive user experiences."
        }
      ]
    }
  ];
}

function getStaticPosts(): Post[] {
  return [
    {
      id: "1",
      user: {
        username: "johndoe",
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Software Engineer passionate about building products.",
        title: "Software Engineer"
      },
      content: "Just shipped a new feature that our users have been asking for! It's amazing to see the impact of good engineering on user experience. #engineering #productivity",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      likes: 12,
      liked: false,
      comments: [
        {
          id: "c1",
          user: {
            username: "janedoe",
            name: "Jane Doe",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg",
            bio: "Product Manager & startup enthusiast.",
            title: "Product Manager"
          },
          text: "Great work John! The user feedback has been amazing.",
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        }
      ],
      image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=720&h=420&fit=crop&crop=entropy&auto=format&q=80"
    },
    {
      id: "2",
      user: {
        username: "janedoe",
        name: "Jane Doe",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        bio: "Product Manager & startup enthusiast.",
        title: "Product Manager"
      },
      content: "Excited to be speaking at the Product Management Conference next month about building user-centric products! Who else is attending?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      likes: 8,
      liked: false,
      comments: []
    }
  ];
}

function getStaticJobs(): Job[] {
  return [
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
        "Strong understanding of CSS, HTML, and responsive design",
        "Experience with state management libraries (Redux, Zustand, etc.)",
        "Familiarity with testing frameworks (Jest, React Testing Library)"
      ],
      benefits: [
        "Competitive salary and equity package",
        "Flexible remote work policy",
        "Health, dental, and vision insurance",
        "Professional development budget"
      ],
      postedDate: "2024-01-15",
      applicationCount: 47,
      companySize: "50-100 employees",
      industry: "Technology",
      remote: true
    },
    {
      id: "j2",
      title: "Product Manager",
      company: "StartupCo",
      location: "San Francisco, CA",
      logo: "https://logo.clearbit.com/startupco.com",
      salary: "$130,000 - $160,000",
      type: "Full-time",
      experience: "3+ years",
      description: "Join our fast-growing startup as a Product Manager. You'll work closely with engineering and design teams to build products that our customers love.",
      requirements: [
        "3+ years of product management experience",
        "Strong analytical and problem-solving skills",
        "Experience with user research and data analysis",
        "Excellent communication and collaboration skills"
      ],
      benefits: [
        "Competitive salary and stock options",
        "Health insurance and wellness benefits",
        "Flexible PTO policy",
        "Learning and development opportunities"
      ],
      postedDate: "2024-01-20",
      applicationCount: 23,
      companySize: "10-50 employees",
      industry: "Technology",
      remote: false
    }
  ];
}

function getStaticRecommendations(): Recommendation[] {
  return [
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
  ];
}

/**
 * Initialize recommendations data - either from database, AI generation, or fallback to static data
 */
export async function initializeRecommendations(): Promise<Recommendation[]> {
  const projectKey = "web_9_autoconnect_recommendations";
  const entityType = "recommendations";
  const cacheKey = `autoconnect_generated_${entityType}_v1`;

  if (isDbLoadModeEnabled() && typeof window !== "undefined") {
    console.log(`🗄️ Database mode enabled, loading ${entityType} from database...`);
    try {
      const dbData = await fetchSeededSelection({
        projectKey,
        entityType,
        seedValue: 1,
        limit: 50
      });
      if (dbData && dbData.length > 0) {
        console.log(`✅ Loaded ${dbData.length} ${entityType} from database`);
        return dbData as Recommendation[];
      } else {
        console.log(`⚠️ No data found in database for ${entityType}, falling back to generation/static`);
      }
    } catch (error) {
      console.warn(`⚠️ Database load failed for ${entityType}, falling back to generation/static:`, error);
    }
  }

  if (!isDataGenerationEnabled()) {
    console.log(`📊 Data generation disabled for ${entityType}, using static data`);
    return getStaticRecommendations();
  }

  const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
  if (cached) {
    try {
      const parsedData = JSON.parse(cached);
      console.log(`💾 Using cached ${entityType} data:`, parsedData.length, entityType);
      return parsedData;
    } catch (error) {
      console.warn(`⚠️ Failed to parse cached ${entityType} data, regenerating...`, error);
    }
  }

  console.log(`🚀 Generating ${entityType} for Autoconnect...`);
  try {
    const result = await generateProjectData(projectKey, 50, undefined, true); // Always save to DB when generating
    if (result.success && result.data.length > 0) {
      console.log(`✅ Generated ${result.data.length} ${entityType} and saved to database`);
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        console.log(`💾 Cached results in localStorage (${cacheKey})`);
      }
      return result.data as Recommendation[];
    } else {
      console.warn(`⚠️ Data generation failed for ${entityType}, falling back to static data:`, result.error);
      return getStaticRecommendations();
    }
  } catch (error) {
    console.error(`❌ Data generation error for ${entityType}, falling back to static data:`, error);
    return getStaticRecommendations();
  }
}
