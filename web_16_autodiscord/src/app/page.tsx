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
import { DMSidebar } from "@/components/DMSidebar";
import { DMChatPanel, type DMMessage } from "@/components/DMChatPanel";
import { CreateServerModal } from "@/components/CreateServerModal";
import { ServerSettingsModal } from "@/components/ServerSettingsModal";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { CURRENT_USER } from "@/constants/mock";
import type { Channel, Message, MessageReaction, Member, Server } from "@/types/discord";

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
  const [viewMode, setViewMode] = useState<"servers" | "dms">("servers");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<Record<string, DMMessage[]>>({});
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({});
  const [localReactions, setLocalReactions] = useState<Record<string, MessageReaction[]>>({});
  const [userReactions, setUserReactions] = useState<Record<string, Set<string>>>({});
  const [unreadChannelIds, setUnreadChannelIds] = useState<Set<string>>(new Set());
  const [createServerModalOpen, setCreateServerModalOpen] = useState(false);
  const [serverSettingsModalOpen, setServerSettingsModalOpen] = useState(false);
  const [localServers, setLocalServers] = useState<Server[]>([]);

  const allServers = useMemo(
    () => [...(data?.servers ?? []), ...localServers],
    [data?.servers, localServers]
  );

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
    () => allServers.find((s) => s.id === selectedServerId) ?? null,
    [allServers, selectedServerId]
  );
  const selectedChannel = useMemo(
    () => data?.channels.find((c) => c.id === selectedChannelId) ?? null,
    [data, selectedChannelId]
  );

  const dmPeers = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    return data.members.filter((m) => {
      if (m.username === CURRENT_USER.username) return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [data]);

  const selectedDMPeer = useMemo(
    () => (selectedUserId ? dmPeers.find((m) => m.id === selectedUserId) ?? null : null),
    [dmPeers, selectedUserId]
  );

  const dmMessagesForPeer = useMemo(
    () => (selectedUserId ? dmMessages[selectedUserId] ?? [] : []),
    [dmMessages, selectedUserId]
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

  const handleSendDMMessage = useCallback((content: string) => {
    if (!selectedUserId) return;
    const msg: DMMessage = {
      id: nextId(),
      fromUserId: "current",
      content,
      timestamp: new Date().toISOString(),
    };
    setDmMessages((prev) => {
      const list = prev[selectedUserId] ?? [];
      return { ...prev, [selectedUserId]: [...list, msg] };
    });
  }, [selectedUserId]);

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
    const removing = userReactions[messageId]?.has(emoji);
    setUserReactions((prev) => {
      const set = new Set(prev[messageId] ?? []);
      if (removing) set.delete(emoji);
      else set.add(emoji);
      return { ...prev, [messageId]: set };
    });
    setLocalReactions((prev) => {
      const list = prev[messageId] ?? [];
      const existing = list.find((r) => r.emoji === emoji);
      if (removing) {
        if (!existing) return prev;
        return {
          ...prev,
          [messageId]:
            existing.count <= 1
              ? list.filter((r) => r.emoji !== emoji)
              : list.map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1 } : r)),
        };
      }
      const next = existing
        ? list.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
        : [...list, { emoji, count: 1 }];
      return { ...prev, [messageId]: next };
    });
  }, [userReactions]);

  const handleCreateServer = useCallback((name: string) => {
    const id = `local-server-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setLocalServers((prev) => [...prev, { id, name, icon: null }]);
    setViewMode("servers");
    setSelectedServerId(id);
    setSelectedChannelId(null);
  }, []);

  const handleDeleteServer = useCallback(
    (serverId: string) => {
      const nextLocal = localServers.filter((s) => s.id !== serverId);
      const remaining = [...(data?.servers ?? []), ...nextLocal];
      setLocalServers(nextLocal);
      if (selectedServerId === serverId) {
        setSelectedServerId(remaining.length > 0 ? remaining[0].id : null);
        setSelectedChannelId(null);
      }
    },
    [data?.servers, localServers, selectedServerId]
  );

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

  if (allServers.length === 0) {
    return (
      <div className="min-h-screen bg-discord-darkest flex flex-col items-center justify-center gap-4 p-8">
        <EmptyState
          title="No servers"
          description="Create a server to get started. (Demo: data is mocked.)"
        />
        <button
          type="button"
          onClick={() => setCreateServerModalOpen(true)}
          className="px-4 py-2 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90"
        >
          Create server
        </button>
        <CreateServerModal
          open={createServerModalOpen}
          onClose={() => setCreateServerModalOpen(false)}
          onCreateServer={handleCreateServer}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ServerList
        servers={allServers}
        selectedId={selectedServerId}
        viewMode={viewMode}
        onSelect={handleSelectServer}
        onViewModeChange={setViewMode}
        onAddServer={() => setCreateServerModalOpen(true)}
      />
      {viewMode === "servers" ? (
        <>
          <ChannelSidebar
            server={selectedServer}
            channels={channelsForServer}
            selectedChannelId={selectedChannelId}
            unreadChannelIds={unreadChannelIds}
            onSelectChannel={handleSelectChannel}
            onOpenServerSettings={() => setServerSettingsModalOpen(true)}
          />
          {selectedChannel ? (
            <ChatPanel
              channel={selectedChannel}
              messages={messagesForChannel}
              localReactions={localReactions}
              onSendMessage={handleSendMessage}
              onReaction={handleReaction}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-discord-channel text-gray-500 p-8 text-center">
              <p className="font-medium">
                {selectedServer ? "No channels in this server" : "Select a channel"}
              </p>
              <p className="text-sm mt-1 text-gray-600">
                {selectedServer?.id.startsWith("local-server-")
                  ? "Created servers don’t have channels in this demo."
                  : "Choose a channel from the list."}
              </p>
            </div>
          )}
          <MemberSidebar members={membersForServer} />
        </>
      ) : (
        <>
          <DMSidebar
            peers={dmPeers}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
          />
          {selectedDMPeer ? (
            <DMChatPanel
              peer={selectedDMPeer}
              messages={dmMessagesForPeer}
              onSendMessage={handleSendDMMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-discord-channel text-gray-500">
              Select a conversation or switch to Servers.
            </div>
          )}
        </>
      )}
      <CreateServerModal
        open={createServerModalOpen}
        onClose={() => setCreateServerModalOpen(false)}
        onCreateServer={handleCreateServer}
      />
      <ServerSettingsModal
        server={selectedServer}
        open={serverSettingsModalOpen}
        onClose={() => setServerSettingsModalOpen(false)}
        onDeleteServer={handleDeleteServer}
      />
    </div>
  );
}
