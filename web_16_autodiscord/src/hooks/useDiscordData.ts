"use client";

import { fetchDiscordEntities } from "@/shared/seeded-loader";
import type { Channel, Member, Message, Server } from "@/types/discord";
import { useCallback, useEffect, useRef, useState } from "react";

const LIMITS = {
  servers: 20,
  channels: 50,
  messages: 100,
  members: 50,
} as const;

export interface DiscordData {
  servers: Server[];
  channels: Channel[];
  messages: Message[];
  members: Member[];
}

export interface UseDiscordDataResult {
  data: DiscordData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function dedupeServers(list: Server[]): Server[] {
  const seen = new Set<string>();
  return list.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

function dedupeChannels(list: Channel[]): Channel[] {
  const seen = new Set<string>();
  return list.filter((c) => {
    const key = `${c.serverId}:${c.name}:${c.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeMessages(list: Message[]): Message[] {
  const seen = new Set<string>();
  return list.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

function dedupeMembers(list: Member[]): Member[] {
  const seen = new Set<string>();
  return list.filter((m) => {
    const key = `${m.serverId}:${m.username}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function useDiscordData(seed: number): UseDiscordDataResult {
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const load = useCallback(async () => {
    cancelledRef.current = false;
    setLoading(true);
    setError(null);

    try {
      const [serversRaw, channelsRaw, messagesRaw, membersRaw] =
        await Promise.all([
          fetchDiscordEntities<Server>("servers", seed, LIMITS.servers),
          fetchDiscordEntities<Channel>("channels", seed, LIMITS.channels),
          fetchDiscordEntities<Message>("messages", seed, LIMITS.messages),
          fetchDiscordEntities<Member>("members", seed, LIMITS.members),
        ]);

      if (cancelledRef.current) return;

      setData({
        servers: dedupeServers(ensureArray(serversRaw)),
        channels: dedupeChannels(ensureArray(channelsRaw)),
        messages: dedupeMessages(ensureArray(messagesRaw)),
        members: dedupeMembers(ensureArray(membersRaw)),
      });
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setData(null);
      }
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [seed]);

  useEffect(() => {
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  return { data, loading, error, reload: load };
}
