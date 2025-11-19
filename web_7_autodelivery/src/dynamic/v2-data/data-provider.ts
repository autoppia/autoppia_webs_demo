/**
 * V2 Data Loading System for web_7_autodelivery
 *
 * Loads different data subsets based on v2 seed.
 */

import { initializeRestaurants } from "@/data/restaurants-enhanced";
import { getTestimonials } from "@/data/testimonials-enhanced";
import { getEffectiveSeed } from "@/shared/seed-resolver";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;

  private constructor() {
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 === "true";
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = this.loadData();
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  private async loadData(seed?: number): Promise<void> {
    if (!this.isEnabled) {
      this.ready = true;
      return;
    }

    try {
      const v2Seed = seed ?? getEffectiveSeed();
      await initializeRestaurants(v2Seed);
      this.ready = true;
    } catch (error) {
      console.error("[DynamicDataProvider] Failed to load data:", error);
      this.ready = true;
    }
  }

  public async reload(seed?: number): Promise<void> {
    await this.loadData(seed);
  }

  public getTestimonials() {
    return getTestimonials();
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

// Re-export for compatibility
export { initializeRestaurants, getTestimonials };

// Export helper functions
export const isDynamicModeEnabled = () => dynamicDataProvider.isReady();
export const getLayoutConfig = (seed?: number) => {
  const { getEffectiveLayoutConfig } = require("@/dynamic/v1-layouts");
  return getEffectiveLayoutConfig(seed);
};
