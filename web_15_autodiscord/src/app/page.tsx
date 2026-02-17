"use client";

import { useEffect, useState, useMemo } from "react";
import { useSeed } from "@/context/SeedContext";
import { useDiscordData } from "@/hooks/useDiscordData";
import { clampSeed } from "@/shared/seed-resolver";
import { ServerList } from "@/components/ServerList";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { MemberSidebar } from "@/components/MemberSidebar";
import type { Channel } from "@/types/discord";

function pickDefaultChannel(channels: Channel[]): string | null {
  if (channels.length === 0) return null;
  const firstText = channels.find((c) => c.type === "text");
  return (firstText ?? channels[0])?.id ?? null;
}

export default function DiscordPage() {
  const { seed } = useSeed();
  const effectiveSeed = useMemo(() => clampSeed(seed ?? 1), [seed]);
  const { data, loading, error } = useDiscordData(effectiveSeed);

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const channelsForServer = useMemo(() => {
    if (!data || !selectedServerId) return [];
    return data.channels.filter((ch) => ch.serverId === selectedServerId);
  }, [data, selectedServerId]);

  const messagesForChannel = useMemo(() => {
    if (!data || !selectedChannelId) return [];
    return data.messages.filter((m) => m.channelId === selectedChannelId);
  }, [data, selectedChannelId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <span className="text-gray-400">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-discord-darkest flex items-center justify-center">
        <span className="text-gray-400">No data</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ServerList
        servers={data.servers}
        selectedId={selectedServerId}
        onSelect={setSelectedServerId}
      />
      <ChannelSidebar
        server={selectedServer}
        channels={channelsForServer}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
      />
      <ChatPanel channel={selectedChannel} messages={messagesForChannel} />
      <MemberSidebar members={membersForServer} />
    </div>
  );
}
