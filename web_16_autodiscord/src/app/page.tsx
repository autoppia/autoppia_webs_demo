"use client";

import { ChannelSidebar } from "@/components/ChannelSidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { CreateChannelModal } from "@/components/CreateChannelModal";
import { CreateServerModal } from "@/components/CreateServerModal";
import { DMChatPanel, type DMMessage } from "@/components/DMChatPanel";
import { DMSidebar } from "@/components/DMSidebar";
import { AddFriendModal } from "@/components/AddFriendModal";
import { ErrorState } from "@/components/ErrorState";
import { HomeDashboard } from "@/components/HomeDashboard";
import { MemberSidebar } from "@/components/MemberSidebar";
import { ServerList } from "@/components/ServerList";
import { ServerSettingsModal } from "@/components/ServerSettingsModal";
import { VoiceChannelPanel } from "@/components/VoiceChannelPanel";
import { CURRENT_USER } from "@/constants/mock";
import { MOCK_USERS, type MockUser } from "@/data/mock-users";
import { useDynamicSystem } from "@/dynamic";
import { getDiscordData, dynamicDataProvider } from "@/dynamic/v2";
import { ID_VARIANTS_MAP } from "@/dynamic/v3";
import { useLocalDiscordOverlay } from "@/context/LocalDiscordOverlayContext";
import { useSeed } from "@/context/SeedContext";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type {
  Channel,
  Member,
  Message,
  MessageReaction,
  Server,
} from "@/types/discord";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function pickDefaultChannel(channels: Channel[]): string | null {
  if (channels.length === 0) return null;
  const firstText = channels.find((c) => c.type === "text");
  return (firstText ?? channels[0])?.id ?? null;
}

function nextId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeChannelParam(raw: string | null): string | null {
  if (!raw) return null;
  const idx = raw.indexOf("/?seed=");
  return idx >= 0 ? raw.slice(0, idx) : raw;
}

export default function DiscordPage() {
  const searchParams = useSearchParams();
  const dyn = useDynamicSystem();
  const { seed } = useSeed();
  const {
    localServers,
    setLocalServers,
    localChannels,
    setLocalChannels,
    localMessages,
    setLocalMessages,
    localReactions,
    setLocalReactions,
    userReactions,
    setUserReactions,
    dmMessages,
    setDmMessages,
    voicePresence,
    setVoicePresence,
    voiceChannelId,
    setVoiceChannelId,
    voiceMuted,
    setVoiceMuted,
    friends,
    setFriends,
  } = useLocalDiscordOverlay();
  const data = getDiscordData();
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(async () => {
    await dynamicDataProvider.reload();
    setRetryCount((c) => c + 1);
  }, []);

  const serverParam = searchParams.get("server");
  const rawChannelParam = searchParams.get("channel");
  const channelParam = normalizeChannelParam(rawChannelParam);
  const viewParam = searchParams.get("view");
  const viewIsDms = viewParam === "dms";

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"servers" | "dms">("servers");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [unreadChannelIds, setUnreadChannelIds] = useState<Set<string>>(
    new Set(),
  );
  const [createServerModalOpen, setCreateServerModalOpen] = useState(false);
  const [createChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const [serverSettingsModalOpen, setServerSettingsModalOpen] = useState(false);
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false);

  const allServers = useMemo(
    () => [...(data?.servers ?? []), ...localServers],
    [data?.servers, localServers],
  );

  const allServersRef = useRef(allServers);
  const localChannelsRef = useRef(localChannels);
  allServersRef.current = allServers;
  localChannelsRef.current = localChannels;

  const channelsForServer = useMemo(() => {
    if (!selectedServerId) return [];
    const apiChannels =
      data?.channels.filter((ch) => ch.serverId === selectedServerId) ?? [];
    const local = localChannels.filter(
      (ch) => ch.serverId === selectedServerId,
    );
    const merged = [...apiChannels, ...local];
    return merged.sort((a, b) => a.position - b.position);
  }, [data, selectedServerId, localChannels]);

  const apiMessagesForChannel = useMemo(() => {
    if (!data || !selectedChannelId) return [];
    return data.messages.filter((m) => m.channelId === selectedChannelId);
  }, [data, selectedChannelId]);

  const messagesForChannel = useMemo(() => {
    const local = selectedChannelId
      ? (localMessages[selectedChannelId] ?? [])
      : [];
    const combined = [...apiMessagesForChannel, ...local].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return combined;
  }, [apiMessagesForChannel, localMessages, selectedChannelId]);

  const membersForServer = useMemo(() => {
    if (!data || !selectedServerId) return [];
    return data.members.filter((m) => m.serverId === selectedServerId);
  }, [data, selectedServerId]);

  const selectedServer = useMemo(
    () => allServers.find((s) => s.id === selectedServerId) ?? null,
    [allServers, selectedServerId],
  );
  const allChannelsForLookup = useMemo(
    () => [...(data?.channels ?? []), ...localChannels],
    [data?.channels, localChannels],
  );
  const selectedChannel = useMemo(
    () => allChannelsForLookup.find((c) => c.id === selectedChannelId) ?? null,
    [allChannelsForLookup, selectedChannelId],
  );

  const dmPeers = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const peers: Member[] = data.members.filter((m) => {
      if (m.username === CURRENT_USER.username) return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    // Add accepted friends from mock users that aren't already peers
    for (const [userId, status] of Object.entries(friends)) {
      if (status !== "accepted" || seen.has(userId)) continue;
      const mockUser = MOCK_USERS.find((u) => u.id === userId);
      if (!mockUser) continue;
      seen.add(userId);
      peers.push({
        id: mockUser.id,
        serverId: "",
        username: mockUser.username,
        displayName: mockUser.displayName,
        avatar: mockUser.avatar,
        role: "user",
        status: mockUser.status,
      });
    }
    return peers;
  }, [data, friends]);

  /** One message per DM peer from channel messages, matched by authorUsername === username */
  const initialDmMessagesByUserId = useMemo((): Record<string, DMMessage[]> => {
    if (!data?.messages?.length || !dmPeers.length) return {};
    const map: Record<string, DMMessage[]> = {};
    for (const peer of dmPeers) {
      const msg = data.messages.find((m) => m.authorUsername === peer.username);
      if (msg) {
        map[peer.id] = [
          {
            id: msg.id,
            fromUserId: peer.id,
            content: msg.content,
            timestamp: msg.timestamp,
          },
        ];
      }
    }
    return map;
  }, [data?.messages, dmPeers]);

  const selectedDMPeer = useMemo(
    () =>
      selectedUserId
        ? (dmPeers.find((m) => m.id === selectedUserId) ?? null)
        : null,
    [dmPeers, selectedUserId],
  );

  const dmMessagesForPeer = useMemo(() => {
    if (!selectedUserId) return [];
    const initial = initialDmMessagesByUserId[selectedUserId] ?? [];
    const fromState = dmMessages[selectedUserId] ?? [];
    const merged = [...initial, ...fromState].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return merged;
  }, [selectedUserId, initialDmMessagesByUserId, dmMessages]);

  const voiceChannelsWithPresence = useMemo(() => {
    const allChannels = allChannelsForLookup.filter((c) => c.type === "voice");
    return allChannels.filter((ch) => (voicePresence[ch.id]?.length ?? 0) > 0);
  }, [allChannelsForLookup, voicePresence]);

  const membersInVoiceChannel = useMemo((): Member[] => {
    if (
      !selectedChannelId ||
      !selectedChannel ||
      selectedChannel.type !== "voice"
    )
      return [];
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
    (serverId: string) =>
      allServers.find((s) => s.id === serverId)?.name ?? serverId,
    [allServers],
  );

  const updateUrl = useCallback(
    (
      serverId: string | null,
      channelId: string | null,
      opts?: { clearView?: boolean },
    ) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (serverId) url.searchParams.set("server", serverId);
      else url.searchParams.delete("server");
      if (channelId) url.searchParams.set("channel", channelId);
      else url.searchParams.delete("channel");
      url.searchParams.set("seed", String(seed));
      if (serverId || channelId) url.searchParams.delete("view");
      else if (opts?.clearView) url.searchParams.delete("view");
      window.history.replaceState({}, "", url.pathname + url.search);
    },
    [seed],
  );

  useEffect(() => {
    setViewMode(viewIsDms ? "dms" : "servers");
  }, [viewIsDms]);

  useEffect(() => {
    if (!data) return;
    if (viewIsDms) {
      setSelectedServerId(null);
      setSelectedChannelId(null);
      return;
    }
    const servers = allServersRef.current;
    const local = localChannelsRef.current;
    const serverId =
      serverParam && servers.some((s) => s.id === serverParam)
        ? serverParam
        : null;
    const firstServerId = servers.length > 0 ? servers[0].id : null;
    const resolvedServerId = serverId ?? firstServerId;
    setSelectedServerId(resolvedServerId);

    if (resolvedServerId) {
      const channels = [...(data.channels ?? []), ...local].filter(
        (ch) => ch.serverId === resolvedServerId,
      );
      const channelId =
        channelParam && channels.some((c) => c.id === channelParam)
          ? channelParam
          : null;
      const defaultChannelId = pickDefaultChannel(channels);
      setSelectedChannelId(channelId ?? defaultChannelId);
      updateUrl(resolvedServerId, channelId ?? defaultChannelId);
    } else {
      setSelectedChannelId(null);
      updateUrl(null, null, { clearView: true });
    }
  }, [data, serverParam, channelParam, updateUrl, viewIsDms]);

  useEffect(() => {
    if (selectedServerId && selectedChannelId)
      updateUrl(selectedServerId, selectedChannelId);
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

  const handleSelectServer = useCallback(
    (id: string) => {
      setSelectedServerId(id);
      updateUrl(id, null);
    },
    [updateUrl],
  );

  const handleViewModeChange = useCallback(
    (mode: "servers" | "dms") => {
      setViewMode(mode);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      url.searchParams.set("seed", String(seed));
      if (mode === "dms") {
        url.searchParams.set("view", "dms");
        url.searchParams.delete("server");
        url.searchParams.delete("channel");
      } else {
        url.searchParams.delete("view");
      }
      window.history.replaceState({}, "", url.pathname + url.search);
    },
    [seed],
  );

  const handleGoHome = useCallback(() => {
    setSelectedServerId(null);
    setSelectedChannelId(null);
    updateUrl(null, null, { clearView: true });
  }, [updateUrl]);

  const handleSelectChannel = useCallback(
    (id: string) => {
      const ch = allChannelsForLookup.find((c) => c.id === id);
      setSelectedChannelId(id);
      setUnreadChannelIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (ch?.type === "voice") {
        setVoicePresence((prev) => {
          const next = { ...prev };
          if (voiceChannelId) {
            next[voiceChannelId] = (prev[voiceChannelId] ?? []).filter(
              (x) => x !== "current",
            );
            if (next[voiceChannelId].length === 0) delete next[voiceChannelId];
          }
          next[id] = [
            ...(prev[id] ?? []).filter((x) => x !== "current"),
            "current",
          ];
          return next;
        });
        setVoiceChannelId(id);
        const serverName =
          allServers.find((s) => s.id === ch.serverId)?.name ?? ch.serverId;
        logEvent(EVENT_TYPES.JOIN_VOICE_CHANNEL, {
          channel_id: id,
          channel_name: ch.name,
          server_id: ch.serverId,
          server_name: serverName,
        });
      }
    },
    [allChannelsForLookup, voiceChannelId, allServers, setVoicePresence, setVoiceChannelId],
  );

  const handleVoiceLeave = useCallback(() => {
    if (!voiceChannelId) return;
    const ch = allChannelsForLookup.find((c) => c.id === voiceChannelId);
    logEvent(EVENT_TYPES.LEAVE_VOICE_CHANNEL, {
      channel_id: voiceChannelId,
      channel_name: ch?.name ?? voiceChannelId,
      server_id: ch?.serverId ?? "",
      server_name: ch ? getServerName(ch.serverId) : "",
    });
    setVoicePresence((prev) => ({
      ...prev,
      [voiceChannelId]: (prev[voiceChannelId] ?? []).filter(
        (x) => x !== "current",
      ),
    }));
    setVoiceChannelId(null);
    setSelectedChannelId(null);
  }, [voiceChannelId, allChannelsForLookup, getServerName, setVoicePresence, setVoiceChannelId]);

  const handleVoiceMuteToggle = useCallback(() => {
    const ch = voiceChannelId
      ? allChannelsForLookup.find((c) => c.id === voiceChannelId)
      : null;
    logEvent(EVENT_TYPES.VOICE_MUTE_TOGGLE, {
      channel_id: voiceChannelId,
      channel_name: ch?.name ?? voiceChannelId ?? "",
      server_id: ch?.serverId ?? "",
      server_name: ch ? getServerName(ch.serverId) : "",
      muted: !voiceMuted,
    });
    setVoiceMuted((v) => !v);
  }, [voiceChannelId, voiceMuted, allChannelsForLookup, getServerName, setVoiceMuted]);

  const handleOpenAddFriend = useCallback(() => {
    setAddFriendModalOpen(true);
    logEvent(EVENT_TYPES.OPEN_ADD_FRIEND, {});
  }, []);

  const handleSendFriendRequest = useCallback(
    (user: MockUser) => {
      setFriends((prev) => ({ ...prev, [user.id]: "pending" }));
      logEvent(EVENT_TYPES.SEND_FRIEND_REQUEST, {
        user_id: user.id,
        username: user.username,
        display_name: user.displayName,
      });
      // Simulate the other user accepting after a short delay
      setTimeout(() => {
        setFriends((prev) => {
          if (prev[user.id] !== "pending") return prev;
          return { ...prev, [user.id]: "accepted" };
        });
        logEvent(EVENT_TYPES.ACCEPT_FRIEND_REQUEST, {
          user_id: user.id,
          username: user.username,
          display_name: user.displayName,
        });
      }, 1500);
    },
    [setFriends],
  );

  const existingPeerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const peer of dmPeers) {
      if (friends[peer.id] === "accepted") continue;
      ids.add(peer.id);
    }
    return ids;
  }, [dmPeers, friends]);

  const handleSendDMMessage = useCallback(
    (content: string) => {
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
    },
    [selectedUserId, setDmMessages],
  );

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
    [selectedChannelId, setLocalMessages],
  );

  const handleReaction = useCallback(
    (messageId: string, emoji: string) => {
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
                : list.map((r) =>
                    r.emoji === emoji ? { ...r, count: r.count - 1 } : r,
                  ),
          };
        }
        const next = existing
          ? list.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r,
            )
          : [...list, { emoji, count: 1 }];
        return { ...prev, [messageId]: next };
      });
    },
    [userReactions, setUserReactions, setLocalReactions],
  );

  const handleCreateServer = useCallback((name: string) => {
    const id = `local-server-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setLocalServers((prev) => [...prev, { id, name, icon: null }]);
    setViewMode("servers");
    setSelectedServerId(id);
    setSelectedChannelId(null);
  }, [setLocalServers]);

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
          setVoicePresence((p) => ({
            ...p,
            [voiceChannelId]: (p[voiceChannelId] ?? []).filter(
              (x) => x !== "current",
            ),
          }));
          setVoiceChannelId(null);
        }
      }
    },
    [data?.servers, localServers, selectedServerId, voiceChannelId, setLocalServers, setLocalChannels, setVoicePresence, setVoiceChannelId],
  );

  const handleCreateChannel = useCallback(
    (name: string, type: "text" | "voice") => {
      if (!selectedServerId) return;
      const maxPosition = channelsForServer.reduce(
        (max, ch) => Math.max(max, ch.position),
        0,
      );
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
        const serverName = selectedServer?.name ?? selectedServerId;
        logEvent(EVENT_TYPES.JOIN_VOICE_CHANNEL, {
          channel_id: id,
          channel_name: name,
          server_id: selectedServerId,
          server_name: serverName,
        });
        setVoiceChannelId(id);
        setVoicePresence((prev) => ({ ...prev, [id]: ["current"] }));
      }
    },
    [selectedServerId, selectedServer, channelsForServer, updateUrl, setLocalChannels, setVoiceChannelId, setVoicePresence],
  );

  const readChannelIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedChannelId) return;
    readChannelIds.current = new Set([
      ...readChannelIds.current,
      selectedChannelId,
    ]);
    setUnreadChannelIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedChannelId);
      return next;
    });
  }, [selectedChannelId]);

  useEffect(() => {
    if (!selectedServerId || channelsForServer.length === 0) return;
    const textChannels = channelsForServer.filter((c) => c.type === "text");
    const read = readChannelIds.current;
    setUnreadChannelIds(
      new Set(
        textChannels
          .filter((ch) => ch.id !== selectedChannelId && !read.has(ch.id))
          .map((ch) => ch.id),
      ),
    );
  }, [selectedServerId, channelsForServer, selectedChannelId]);

  if (!data) {
    return (
      <ErrorState
        message="Failed to load data"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" data-testid={dyn.v3.getVariant("discord-page", undefined, "discord-page")}>
      <ServerList
        servers={allServers}
        selectedId={selectedServerId}
        viewMode={viewMode}
        onSelect={handleSelectServer}
        onViewModeChange={handleViewModeChange}
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
              hasServers={allServers.length > 0}
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
                    <p className="font-medium">
                      Voice channel: {selectedChannel.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelectChannel(selectedChannel.id)}
                      className="mt-2 px-4 py-2 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90"
                      data-testid={dyn.v3.getVariant("voice-channel-join", ID_VARIANTS_MAP, "voice-channel-join")}
                    >
                      Join
                    </button>
                  </div>
                )
              ) : selectedChannel ? (
                <ChatPanel
                  channel={selectedChannel}
                  serverName={selectedServer?.name ?? ""}
                  messages={messagesForChannel}
                  localReactions={localReactions}
                  onSendMessage={handleSendMessage}
                  onReaction={handleReaction}
                />
              ) : (
                <div
                  className="flex-1 flex flex-col items-center justify-center bg-discord-channel text-gray-500 p-8 text-center"
                  data-testid={dyn.v3.getVariant("empty-channel-state", ID_VARIANTS_MAP, "empty-channel-state")}
                >
                  <p className="font-medium">
                    {selectedServer
                      ? "No channels in this server"
                      : "Select a channel"}
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
            onAddFriend={handleOpenAddFriend}
          />
          {selectedDMPeer ? (
            <DMChatPanel
              peer={selectedDMPeer}
              messages={dmMessagesForPeer}
              onSendMessage={handleSendDMMessage}
            />
          ) : (
            <div
              className="flex-1 flex items-center justify-center bg-discord-channel text-gray-500"
              data-testid={dyn.v3.getVariant("dm-empty-state", ID_VARIANTS_MAP, "dm-empty-state")}
            >
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
      <AddFriendModal
        open={addFriendModalOpen}
        onClose={() => setAddFriendModalOpen(false)}
        friends={friends}
        onSendRequest={handleSendFriendRequest}
        existingPeerIds={existingPeerIds}
      />
    </div>
  );
}
