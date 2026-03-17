"use client";

import type { DiscordData } from "@/data/discord";
import { getDiscordCache, initializeDiscord } from "@/data/discord";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";

export class DynamicDataProvider {
  private static instance: DynamicDataProvider;
  private data: DiscordData | null = null;
  private ready = false;
  private readyPromise: Promise<void>;
  private currentSeed = 1;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
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

  private getSeed(): number {
    if (!isV2Enabled()) return 1;
    if (typeof window === "undefined") return 1;
    return clampSeed(getSeedFromUrl());
  }

  private async loadData(): Promise<void> {
    try {
      const effectiveSeed = this.getSeed();
      this.currentSeed = effectiveSeed;
      this.data = await initializeDiscord(effectiveSeed);
      if (!this.data) {
        this.data = {
          servers: [],
          channels: [],
          messages: [],
          members: [],
        };
      }
    } catch (error) {
      console.error("[autodiscord] Failed to initialize Discord data", error);
      this.data = {
        servers: [],
        channels: [],
        messages: [],
        members: [],
      };
    } finally {
      this.ready = true;
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  public whenReady(): Promise<void> {
    return this.readyPromise;
  }

  public async reload(seedValue?: number | null): Promise<void> {
    if (typeof window === "undefined") return;

    const targetSeed = isV2Enabled()
      ? clampSeed(seedValue ?? this.getSeed())
      : 1;

    if (targetSeed === this.currentSeed && this.ready) {
      return;
    }

    this.currentSeed = targetSeed;
    this.ready = false;

    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    this.loadingPromise = (async () => {
      try {
        this.data = await initializeDiscord(targetSeed);
        if (!this.data) {
          this.data = {
            servers: [],
            channels: [],
            messages: [],
            members: [],
          };
        }
        this.ready = true;
      } catch (error) {
        console.error("[autodiscord] Failed to reload Discord data", error);
        this.data = {
          servers: [],
          channels: [],
          messages: [],
          members: [],
        };
        this.ready = true;
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  public getData(): DiscordData | null {
    return this.data ?? getDiscordCache();
  }

  public getServers() {
    return this.getData()?.servers ?? [];
  }

  public getChannels() {
    return this.getData()?.channels ?? [];
  }

  public getMessages() {
    return this.getData()?.messages ?? [];
  }

  public getMembers() {
    return this.getData()?.members ?? [];
  }
}

export const dynamicDataProvider = DynamicDataProvider.getInstance();

export const getDiscordData = () => dynamicDataProvider.getData();
export const getServers = () => dynamicDataProvider.getServers();
export const getChannels = () => dynamicDataProvider.getChannels();
export const getMessages = () => dynamicDataProvider.getMessages();
export const getMembers = () => dynamicDataProvider.getMembers();
export const whenReady = () => dynamicDataProvider.whenReady();
