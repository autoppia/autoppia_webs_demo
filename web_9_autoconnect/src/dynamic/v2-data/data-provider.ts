/**
 * V2 Data Loading System for web_9_autoconnect
 * 
 * Loads different data subsets based on v2 seed.
 */

import { loadEntity } from '@/data/autoconnect-enhanced';
import { getEffectiveSeed } from '@/shared/seed-resolver';

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled = false;
  private ready = false;
  private readyPromise: Promise<void>;

  private constructor() {
    this.isEnabled = process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2 === 'true';
    if (typeof window === "undefined") {
      this.ready = true;
      this.readyPromise = Promise.resolve();
      return;
    }
    this.readyPromise = Promise.resolve();
    this.ready = true;
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  public async loadData(entityType: string, seed?: number): Promise<any> {
    if (!this.isEnabled) {
      this.ready = true;
      return null;
    }

    try {
      const v2Seed = seed ?? getEffectiveSeed();
      const entity = await loadEntity(entityType, v2Seed);
      this.ready = true;
      return entity;
    } catch (error) {
      console.error("[DynamicDataProvider] Failed to load entity:", error);
      this.ready = true;
      return null;
    }
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
export { loadEntity };

// Export helper functions
export const isDynamicModeEnabled = () => dynamicDataProvider.isReady();
export const getLayoutConfig = (seed?: number) => {
  const { getEffectiveLayoutConfig } = require('@/dynamic/v1-layouts');
  return getEffectiveLayoutConfig(seed);
};
