"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
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
import { CreateChannelModal } from "@/components/CreateChannelModal";
import { ServerSettingsModal } from "@/components/ServerSettingsModal";
import { HomeDashboard } from "@/components/HomeDashboard";
import { VoiceChannelPanel } from "@/components/VoiceChannelPanel";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { CURRENT_USER } from "@/constants/mock";
import { EVENT_TYPES, logEvent } from "@/library/events";
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
  const [createChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const [serverSettingsModalOpen, setServerSettingsModalOpen] = useState(false);
  const [localServers, setLocalServers] = useState<Server[]>([]);
  /** Local channels (and voice presence) are client-only; not persisted to API. */
  const [localChannels, setLocalChannels] = useState<Channel[]>([]);
  const [voicePresence, setVoicePresence] = useState<Record<string, string[]>>({});
  const [voiceChannelId, setVoiceChannelId] = useState<string | null>(null);
  const [voiceMuted, setVoiceMuted] = useState(false);

  const allServers = useMemo(
    () => [...(data?.servers ?? []), ...localServers],
    [data?.servers, localServers]
  );

  const allServersRef = useRef(allServers);
  const localChannelsRef = useRef(localChannels);
  allServersRef.current = allServers;
  localChannelsRef.current = localChannels;

  const channelsForServer = useMemo(() => {
    if (!selectedServerId) return [];
    const apiChannels = data?.channels.filter((ch) => ch.serverId === selectedServerId) ?? [];
    const local = localChannels.filter((ch) => ch.serverId === selectedServerId);
    const merged = [...apiChannels, ...local];
    return merged.sort((a, b) => a.position - b.position);
  }, [data, selectedServerId, localChannels]);

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
  const allChannelsForLookup = useMemo(
    () => [...(data?.channels ?? []), ...localChannels],
    [data?.channels, localChannels]
  );
  const selectedChannel = useMemo(
    () => allChannelsForLookup.find((c) => c.id === selectedChannelId) ?? null,
    [allChannelsForLookup, selectedChannelId]
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

  const voiceChannelsWithPresence = useMemo(() => {
    const allChannels = allChannelsForLookup.filter((c) => c.type === "voice");
    return allChannels.filter((ch) => (voicePresence[ch.id]?.length ?? 0) > 0);
  }, [allChannelsForLookup, voicePresence]);

  const membersInVoiceChannel = useMemo((): Member[] => {
    if (!selectedChannelId || !selectedChannel || selectedChannel.type !== "voice") return [];
    const ids = voicePresence[selectedChannelId] ?? [];
    const members: Member[] = [];
    for (const id of ids) {
      if (id === "current") {
        members.push({
          id: "current",
          serverId: "",
          username: CURRENT_USER.username,
          displayName: CURRENT_USER.displayName,
          avatar: "",
          role: "user",
          status: "online",
        });
      } else {
        const m = data?.members.find((x) => x.id === id);
        if (m) members.push(m);
      }
    }
    return members;
  }, [selectedChannelId, selectedChannel, voicePresence, data?.members]);

  const getServerName = useCallback(
    (serverId: string) => allServers.find((s) => s.id === serverId)?.name ?? serverId,
    [allServers]
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
    const servers = allServersRef.current;
    const local = localChannelsRef.current;
    const serverId = serverParam && servers.some((s) => s.id === serverParam) ? serverParam : null;
    const firstServerId = servers.length > 0 ? servers[0].id : null;
    const resolvedServerId = serverId ?? firstServerId;
    setSelectedServerId(resolvedServerId);

    if (resolvedServerId) {
      const channels = [...(data.channels ?? []), ...local].filter(
        (ch) => ch.serverId === resolvedServerId
      );
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

  const handleGoHome = useCallback(() => {
    setSelectedServerId(null);
    setSelectedChannelId(null);
  }, []);

  const handleSelectChannel = useCallback(
    (id: string) => {
      const ch = allChannelsForLookup.find((c) => c.id === id);
      setSelectedChannelId(id);
      if (ch?.type === "voice") {
        setVoicePresence((prev) => {
          const next = { ...prev };
          if (voiceChannelId) {
            next[voiceChannelId] = (prev[voiceChannelId] ?? []).filter((x) => x !== "current");
            if (next[voiceChannelId].length === 0) delete next[voiceChannelId];
          }
          next[id] = [...(prev[id] ?? []).filter((x) => x !== "current"), "current"];
          return next;
        });
        setVoiceChannelId(id);
        logEvent(EVENT_TYPES.JOIN_VOICE_CHANNEL, { channel_id: id, server_id: ch.serverId });
      }
    },
    [allChannelsForLookup, voiceChannelId]
  );

  const handleVoiceLeave = useCallback(() => {
    if (!voiceChannelId) return;
    setVoicePresence((prev) => ({
      ...prev,
      [voiceChannelId]: (prev[voiceChannelId] ?? []).filter((x) => x !== "current"),
    }));
    setVoiceChannelId(null);
    setSelectedChannelId(null);
  }, [voiceChannelId]);

  const handleVoiceMuteToggle = useCallback(() => {
    setVoiceMuted((v) => !v);
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
      setLocalChannels((prev) => prev.filter((ch) => ch.serverId !== serverId));
      if (selectedServerId === serverId) {
        setSelectedServerId(remaining.length > 0 ? remaining[0].id : null);
        setSelectedChannelId(null);
        if (voiceChannelId) {
          setVoicePresence((p) => ({ ...p, [voiceChannelId]: (p[voiceChannelId] ?? []).filter((x) => x !== "current") }));
          setVoiceChannelId(null);
        }
      }
    },
    [data?.servers, localServers, selectedServerId, voiceChannelId]
  );

  const handleCreateChannel = useCallback(
    (name: string, type: "text" | "voice") => {
      if (!selectedServerId) return;
      const maxPosition = channelsForServer.reduce((max, ch) => Math.max(max, ch.position), 0);
      const id = `local-channel-${selectedServerId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const channel: Channel = {
        id,
        serverId: selectedServerId,
        name,
        type,
        position: maxPosition + 1,
      };
      setLocalChannels((prev) => [...prev, channel]);
      setCreateChannelModalOpen(false);
      setSelectedChannelId(id);
      updateUrl(selectedServerId, id);
      if (type === "voice") {
        logEvent(EVENT_TYPES.JOIN_VOICE_CHANNEL, { channel_id: id, server_id: selectedServerId });
        setVoiceChannelId(id);
        setVoicePresence((prev) => ({ ...prev, [id]: ["current"] }));
      }
    },
    [selectedServerId, channelsForServer, updateUrl]
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
          data-testid="create-server-first"
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
    <div className="flex h-screen overflow-hidden" data-testid="discord-page">
      <ServerList
        servers={allServers}
        selectedId={selectedServerId}
        viewMode={viewMode}
        onSelect={handleSelectServer}
        onViewModeChange={setViewMode}
        onAddServer={() => setCreateServerModalOpen(true)}
        onGoHome={handleGoHome}
      />
      {viewMode === "servers" ? (
        <>
          {selectedServerId === null ? (
            <HomeDashboard
              members={data.members}
              voiceChannels={voiceChannelsWithPresence}
              voicePresence={voicePresence}
              getServerName={getServerName}
            />
          ) : (
            <>
              <ChannelSidebar
                server={selectedServer}
                channels={channelsForServer}
                selectedChannelId={selectedChannelId}
                unreadChannelIds={unreadChannelIds}
                onSelectChannel={handleSelectChannel}
                onOpenServerSettings={() => setServerSettingsModalOpen(true)}
                onAddChannel={() => setCreateChannelModalOpen(true)}
              />
              {selectedChannel?.type === "voice" ? (
                voiceChannelId === selectedChannelId ? (
                  <VoiceChannelPanel
                    channel={selectedChannel}
                    membersInChannel={membersInVoiceChannel}
                    currentUserMuted={voiceMuted}
                    onMuteToggle={handleVoiceMuteToggle}
                    onLeave={handleVoiceLeave}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-discord-channel text-gray-500 p-8">
                    <p className="font-medium">Voice channel: {selectedChannel.name}</p>
                    <button
                      type="button"
                      onClick={() => handleSelectChannel(selectedChannel.id)}
                      className="mt-2 px-4 py-2 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90"
                      data-testid="voice-channel-join"
                    >
                      Join
                    </button>
                  </div>
                )
              ) : selectedChannel ? (
                <ChatPanel
                  channel={selectedChannel}
                  messages={messagesForChannel}
                  localReactions={localReactions}
                  onSendMessage={handleSendMessage}
                  onReaction={handleReaction}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-discord-channel text-gray-500 p-8 text-center" data-testid="empty-channel-state">
                  <p className="font-medium">
                    {selectedServer ? "No channels in this server" : "Select a channel"}
                  </p>
                  <p className="text-sm mt-1 text-gray-600">
                    {selectedServer?.id.startsWith("local-server-")
                      ? "Use “Create channel” below to add text or voice channels."
                      : "Choose a channel from the list."}
                  </p>
                </div>
              )}
              <MemberSidebar members={membersForServer} />
            </>
          )}
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
            <div className="flex-1 flex items-center justify-center bg-discord-channel text-gray-500" data-testid="dm-empty-state">
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
      <CreateChannelModal
        open={createChannelModalOpen}
        serverId={selectedServerId}
        serverName={selectedServer?.name ?? ""}
        onClose={() => setCreateChannelModalOpen(false)}
        onCreateChannel={handleCreateChannel}
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
