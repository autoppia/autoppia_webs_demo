import { getEffectiveLayoutConfig, isDynamicEnabled } from "./seedLayout";
import { isDbLoadModeEnabled } from "@/shared/seeded-loader";

// Check if dynamic HTML is enabled via environment variable
const isDynamicHtmlEnabled = (): boolean => {
  return isDynamicEnabled();
};

// Dynamic data provider with v2-seed support
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

  /**
   * Get v2 seed directly from URL
   */
  private getV2SeedFromUrl(): number | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("v2-seed");
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 300) return null;
    return parsed;
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }

  // Get effective seed value - returns 36 (default) when dynamic HTML is disabled
  // Validates seed is between 1-300, defaults to 36 if invalid
  public getEffectiveSeed(providedSeed: number = 36): number {
    if (!this.isEnabled) {
      return 36;
    }
    
    // Validate seed range (1-300)
    if (providedSeed < 1 || providedSeed > 300) {
      return 36;
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
        name: "John D.",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        country: "United States",
        rate: "$50/hr",
        role: "Frontend Developer",
        rating: "4.8",
        jobs: "25 jobs",
        rehire: true
      },
      {
        id: "2",
        name: "Maria S.",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        country: "Spain",
        rate: "$45/hr",
        role: "UI Designer",
        rating: "4.9",
        jobs: "18 jobs",
        rehire: false
      },
      {
        id: "3",
        name: "Ahmed K.",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        country: "UAE",
        rate: "$40/hr",
        role: "Content Writer",
        rating: "4.7",
        jobs: "30 jobs",
        rehire: true
      }
    ];
  }

  public getStaticExperts(): Array<{
    slug: string;
    name: string;
    country: string;
    role: string;
    avatar: string;
    rate: string;
    rating: number;
    jobs: number;
  }> {
    return [
      {
        slug: "john-d",
        name: "John D.",
        country: "United States",
        role: "Frontend Developer",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        rate: "$50/hr",
        rating: 4.8,
        jobs: 25
      },
      {
        slug: "maria-s",
        name: "Maria S.",
        country: "Spain",
        role: "UI Designer",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        rate: "$45/hr",
        rating: 4.9,
        jobs: 18
      },
      {
        slug: "ahmed-k",
        name: "Ahmed K.",
        country: "UAE",
        role: "Content Writer",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        rate: "$40/hr",
        rating: 4.7,
        jobs: 30
      }
    ];
  }
}

// Export singleton
export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Export helper functions
export function isDynamicModeEnabled(): boolean {
  return dynamicDataProvider.isDynamicModeEnabled();
}

export function getLayoutConfig(seed?: number) {
  return dynamicDataProvider.getLayoutConfig(seed);
}
