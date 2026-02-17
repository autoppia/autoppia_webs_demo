"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSeed } from "@/context/SeedContext";
import { useDiscordData } from "@/hooks/useDiscordData";
import { clampSeed } from "@/shared/seed-resolver";
import { ServerList } from "@/components/ServerList";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { MemberSidebar } from "@/components/MemberSidebar";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { CURRENT_USER } from "@/constants/mock";
import type { Channel, Message, MessageReaction } from "@/types/discord";

function pickDefaultChannel(channels: Channel[]): string | null {
  if (channels.length === 0) return null;
  const firstText = channels.find((c) => c.type === "text");
  return (firstText ?? channels[0])?.id ?? null;
}

function nextId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function DiscordPage() {
  const searchParams = useSearchParams();
  const { seed } = useSeed();
  const effectiveSeed = useMemo(() => clampSeed(seed ?? 1), [seed]);
  const { data, loading, error, reload } = useDiscordData(effectiveSeed);

  const serverParam = searchParams.get("server");
  const channelParam = searchParams.get("channel");

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({});
  const [localReactions, setLocalReactions] = useState<Record<string, MessageReaction[]>>({});
  const [unreadChannelIds, setUnreadChannelIds] = useState<Set<string>>(new Set());

  const channelsForServer = useMemo(() => {
    if (!data || !selectedServerId) return [];
    return data.channels.filter((ch) => ch.serverId === selectedServerId);
  }, [data, selectedServerId]);

  const apiMessagesForChannel = useMemo(() => {
    if (!data || !selectedChannelId) return [];
    return data.messages.filter((m) => m.channelId === selectedChannelId);
  }, [data, selectedChannelId]);

  const messagesForChannel = useMemo(() => {
    const local = selectedChannelId ? localMessages[selectedChannelId] ?? [] : [];
    const combined = [...apiMessagesForChannel, ...local].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return combined;
  }, [apiMessagesForChannel, localMessages, selectedChannelId]);

  const membersForServer = useMemo(() => {
    if (!data || !selectedServerId) return [];
    return data.members.filter((m) => m.serverId === selectedServerId);
  }, [data, selectedServerId]);

  const selectedServer = useMemo(
    () => data?.servers.find((s) => s.id === selectedServerId) ?? null,
    [data, selectedServerId]
  );
  const selectedChannel = useMemo(
    () => data?.channels.find((c) => c.id === selectedChannelId) ?? null,
    [data, selectedChannelId]
  );

  const updateUrl = useCallback((serverId: string | null, channelId: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (serverId) url.searchParams.set("server", serverId);
    else url.searchParams.delete("server");
    if (channelId) url.searchParams.set("channel", channelId);
    else url.searchParams.delete("channel");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, []);

  useEffect(() => {
    if (!data) return;
    const servers = data.servers;
    const serverId = serverParam && servers.some((s) => s.id === serverParam) ? serverParam : null;
    const firstServerId = servers.length > 0 ? servers[0].id : null;
    const resolvedServerId = serverId ?? firstServerId;
    setSelectedServerId(resolvedServerId);

    if (resolvedServerId) {
      const channels = data.channels.filter((ch) => ch.serverId === resolvedServerId);
      const channelId =
        channelParam && channels.some((c) => c.id === channelParam) ? channelParam : null;
      const defaultChannelId = pickDefaultChannel(channels);
      setSelectedChannelId(channelId ?? defaultChannelId);
      updateUrl(resolvedServerId, channelId ?? defaultChannelId);
    }
  }, [data, serverParam, channelParam, updateUrl]);

  useEffect(() => {
    if (selectedServerId && selectedChannelId) updateUrl(selectedServerId, selectedChannelId);
  }, [selectedServerId, selectedChannelId, updateUrl]);

  useEffect(() => {
    if (!data) return;
    if (data.servers.length > 0 && selectedServerId === null) {
      setSelectedServerId(data.servers[0].id);
    }
  }, [data, selectedServerId]);

  useEffect(() => {
    if (!selectedServerId || channelsForServer.length === 0) {
      setSelectedChannelId(null);
      return;
    }
    const valid = channelsForServer.some((c) => c.id === selectedChannelId);
    if (!valid) {
      setSelectedChannelId(pickDefaultChannel(channelsForServer));
    }
  }, [selectedServerId, channelsForServer, selectedChannelId]);

  const handleSelectServer = useCallback((id: string) => {
    setSelectedServerId(id);
  }, []);

  const handleSelectChannel = useCallback((id: string) => {
    setSelectedChannelId(id);
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedChannelId) return;
      const msg: Message = {
        id: nextId(),
        channelId: selectedChannelId,
        authorUsername: CURRENT_USER.username,
        content,
        timestamp: new Date().toISOString(),
      };
      setLocalMessages((prev) => {
        const list = prev[selectedChannelId] ?? [];
        return { ...prev, [selectedChannelId]: [...list, msg] };
      });
    },
    [selectedChannelId]
  );

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    setLocalReactions((prev) => {
      const list = prev[messageId] ?? [];
      const existing = list.find((r) => r.emoji === emoji);
      const next = existing
        ? list.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
        : [...list, { emoji, count: 1 }];
      return { ...prev, [messageId]: next };
    });
  }, []);

  useEffect(() => {
    if (!selectedServerId || channelsForServer.length === 0) return;
    const textChannels = channelsForServer.filter((c) => c.type === "text");
    setUnreadChannelIds(
      new Set(textChannels.filter((ch) => ch.id !== selectedChannelId).map((ch) => ch.id))
    );
  }, [selectedServerId, selectedChannelId, channelsForServer]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <span className="text-gray-400">No data</span>
      </div>
    );
  }

  if (data.servers.length === 0) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <EmptyState
          title="No servers"
          description="Create or join a server to get started. (Demo: data is mocked.)"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ServerList
        servers={data.servers}
        selectedId={selectedServerId}
        onSelect={handleSelectServer}
      />
      <ChannelSidebar
        server={selectedServer}
        channels={channelsForServer}
        selectedChannelId={selectedChannelId}
        unreadChannelIds={unreadChannelIds}
        onSelectChannel={handleSelectChannel}
      />
      <ChatPanel
        channel={selectedChannel}
        messages={messagesForChannel}
        localReactions={localReactions}
        onSendMessage={handleSendMessage}
        onReaction={handleReaction}
      />
      <MemberSidebar members={membersForServer} />
    </div>
  );
}
