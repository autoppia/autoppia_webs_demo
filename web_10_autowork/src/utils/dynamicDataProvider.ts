import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider that returns either seed data or empty arrays based on config
export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;

  private constructor() {
    this.isEnabled = isDynamicHtmlEnabled();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get effective seed value - returns 1 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 1 if invalid
  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }
    
    // Validate seed range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 1;
    }
    
    return providedSeed;
  }

  // Get layout configuration based on seed
  public getLayoutConfig(seed?: number) {
    return getEffectiveLayoutConfig(seed);
  }

  // Static Job data - always available
  public getStaticJobs(): Array<{
    id: string;
    title: string;
    status: string;
    start: string;
    timestr: string;
    time: string;
    activity: string;
  }> {
    return [
      {
        id: "1",
        title: "Build responsive WordPress site with booking/payment functionality",
        status: "In progress",
        start: "Jan 15, 2024",
        timestr: "Started",
        time: "2 days ago",
        activity: "Last activity: 2 hours ago"
      },
      {
        id: "2",
        title: "Graphic designer needed to design ad creative for multiple campaigns",
        status: "Completed",
        start: "Jan 10, 2024",
        timestr: "Completed",
        time: "5 days ago",
        activity: "Last activity: 1 day ago"
      },
      {
        id: "3",
        title: "Facebook ad specialist needed for product launch",
        status: "Pending",
        start: "Jan 12, 2024",
        timestr: "Pending",
        time: "3 days ago",
        activity: "Last activity: 3 hours ago"
      }
    ];
  }

  public getStaticHires(): Array<{
    id: string;
    name: string;
    avatar: string;
    country: string;
    rate: string;
    role: string;
    rating: string;
    jobs: string;
    rehire: boolean;
  }> {
    return [
      {
        id: "1",
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        country: "United States",
        rate: "$45/hr",
        role: "Frontend Developer",
        rating: "4.9",
        jobs: "12",
        rehire: true
      },
      {
        id: "2",
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        country: "Canada",
        rate: "$60/hr",
        role: "Full Stack Developer",
        rating: "4.8",
        jobs: "8",
        rehire: false
      },
      {
        id: "3",
        name: "Emily Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        country: "Spain",
        rate: "$35/hr",
        role: "UI/UX Designer",
        rating: "4.9",
        jobs: "15",
        rehire: true
      }
    ];
  }

  public getStaticExperts(): Array<{
    id: string;
    name: string;
    avatar: string;
    country: string;
    role: string;
    rate: string;
    rating: string;
    jobs: string;
    desc: string;
    consultation: string;
  }> {
    return [
      {
        id: "1",
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        country: "South Korea",
        role: "Senior Software Architect",
        rate: "$120/hr",
        rating: "4.9",
        jobs: "25+",
        desc: "Expert in scalable system design and cloud architecture. Specializes in microservices and DevOps practices.",
        consultation: "30 min consultation"
      },
      {
        id: "2",
        name: "Lisa Wang",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        country: "China",
        role: "Product Strategy Consultant",
        rate: "$95/hr",
        rating: "4.8",
        jobs: "18+",
        desc: "Helps startups and enterprises define product strategy, user research, and go-to-market planning.",
        consultation: "45 min consultation"
      }
    ];
  }
}

// Export singleton instance
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Helper functions for easy access
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);

// Static data helpers
export const getStaticJobs = () => dynamicDataProvider.getStaticJobs();
export const getStaticHires = () => dynamicDataProvider.getStaticHires();
export const getStaticExperts = () => dynamicDataProvider.getStaticExperts();
