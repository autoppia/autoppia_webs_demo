/**
 * V2 Data Loading System for web_17_autochess
 *
 * Stub implementation — V2 (database-backed dynamic data) is not used
 * in this project. All chess data is generated deterministically from seeds.
 */

export interface ChessDataRecord {
  id: string;
  type: string;
}

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private isEnabled = false;
  private ready = true;

  private constructor() {
    this.isEnabled =
      process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE === "true";
  }

  public static getInstance(): DynamicDataProvider {
    if (!DynamicDataProvider.instance) {
      DynamicDataProvider.instance = new DynamicDataProvider();
    }
    return DynamicDataProvider.instance;
  }

  public async whenReady(): Promise<void> {
    return Promise.resolve();
  }

  public isReady(): boolean {
    return this.ready;
  }

  public getData(): ChessDataRecord[] {
    return [];
  }

  public async reload(_seed?: number): Promise<void> {
    // No-op for chess project
  }

  public isDynamicModeEnabled(): boolean {
    return this.isEnabled;
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const isDynamicModeEnabled = () =>
  dynamicDataProvider.isDynamicModeEnabled();
