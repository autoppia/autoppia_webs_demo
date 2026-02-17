"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { fetchDiscordEntities } from "@/shared/seeded-loader";
import type { Server, Channel, Message, Member } from "@/types/discord";

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
      const [servers, channels, messages, members] = await Promise.all([
        fetchDiscordEntities<Server>("servers", seed, LIMITS.servers),
        fetchDiscordEntities<Channel>("channels", seed, LIMITS.channels),
        fetchDiscordEntities<Message>("messages", seed, LIMITS.messages),
        fetchDiscordEntities<Member>("members", seed, LIMITS.members),
      ]);

      if (cancelledRef.current) return;

      setData({
        servers: ensureArray(servers),
        channels: ensureArray(channels),
        messages: ensureArray(messages),
        members: ensureArray(members),
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
