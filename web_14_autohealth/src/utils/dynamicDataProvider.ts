import { getEffectiveLayoutConfig, isDynamicEnabled } from './seedLayout';

class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean = false;

  private constructor() {
    this.isEnabled = isDynamicEnabled();
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

  public getEffectiveSeed(providedSeed: number = 1): number {
    if (!this.isEnabled) {
      return 1;
    }
    // Ensure minimum of 1; let values > 300 pass through so layout resolver can return default
    if (providedSeed < 1) {
      return 1;
    }
    return providedSeed;
  }

  public getLayoutConfig(seed?: number) {
    return getEffectiveLayoutConfig(seed);
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();
export const isDynamicModeEnabled = () => dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) => dynamicDataProvider.getEffectiveSeed(providedSeed ?? 1);
export const getLayoutConfig = (seed?: number) => dynamicDataProvider.getLayoutConfig(seed);


