import { fetchSeededSelection } from "@/shared/seeded-loader";
import { clampSeed, getSeedFromUrl } from "@/shared/seed-resolver";
import { isV2Enabled } from "@/dynamic/shared/flags";
import type { Channel, Member, Message, Server } from "@/types/discord";

export interface DiscordData {
  servers: Server[];
  channels: Channel[];
  messages: Message[];
  members: Member[];
}

const LIMITS = {
  servers: 20,
  channels: 50,
  messages: 100,
  members: 50,
} as const;

let discordCache: DiscordData | null = null;

const resolveSeed = (seedValue?: number | null): number => {
  // V2 rule: seed always comes from URL, but if V2 is disabled we force seed=1.
  if (!isV2Enabled()) return 1;
  if (typeof window === "undefined") return clampSeed(1);
  if (seedValue != null) return clampSeed(seedValue);
  return getSeedFromUrl(window.location.search ?? "");
};

/**
 * Initialize Discord data from webs_server with the V2 seed rule.
 *
 * V2 rule:
 * - If V2 is enabled: use the seed from the URL (or an explicit override), clamped to range.
 * - If V2 is disabled: always behave as seed=1.
 */
export async function initializeDiscord(
  seedOverride?: number | null,
): Promise<DiscordData> {
  const effectiveSeed = resolveSeed(seedOverride);

  try {
    const [servers, channels, messages, members] = await Promise.all([
      fetchSeededSelection<Server>({
        projectKey: "web_16_autodiscord",
        entityType: "servers",
        seedValue: effectiveSeed,
        limit: LIMITS.servers,
        method: "distribute",
      }),
      fetchSeededSelection<Channel>({
        projectKey: "web_16_autodiscord",
        entityType: "channels",
        seedValue: effectiveSeed,
        limit: LIMITS.channels,
        method: "distribute",
      }),
      fetchSeededSelection<Message>({
        projectKey: "web_16_autodiscord",
        entityType: "messages",
        seedValue: effectiveSeed,
        limit: LIMITS.messages,
        method: "distribute",
      }),
      fetchSeededSelection<Member>({
        projectKey: "web_16_autodiscord",
        entityType: "members",
        seedValue: effectiveSeed,
        limit: LIMITS.members,
        method: "distribute",
      }),
    ]);

    discordCache = {
      servers: Array.isArray(servers) ? servers : [],
      channels: Array.isArray(channels) ? channels : [],
      messages: Array.isArray(messages) ? messages : [],
      members: Array.isArray(members) ? members : [],
    };

    return discordCache;
  } catch (error) {
    console.warn(
      "[autodiscord] Backend unavailable, using empty dataset",
      error,
    );
    discordCache = {
      servers: [],
      channels: [],
      messages: [],
      members: [],
    };
    return discordCache;
  }
}

export function getDiscordCache(): DiscordData | null {
  return discordCache;
}
