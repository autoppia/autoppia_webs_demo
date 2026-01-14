
import { isV1Enabled } from '../shared/flags'
class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = isV1Enabled();
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
    if (providedSeed < 1) return 1;
    if (providedSeed > 300) return ((providedSeed % 300) + 1);
    return providedSeed;
  }

  // public getLayoutConfig(seed?: number) {
  //   return getEffectiveLayoutConfig(seed);
  // }
}

const dynamicDataProvider = DynamicDataProvider.getInstance();

export const isDynamicModeEnabled = () =>
  dynamicDataProvider.isDynamicModeEnabled();
export const getEffectiveSeed = (providedSeed?: number) =>
  dynamicDataProvider.getEffectiveSeed(providedSeed ?? 1);
// export const getLayoutConfig = (seed?: number) =>
//   dynamicDataProvider.getLayoutConfig(seed);
