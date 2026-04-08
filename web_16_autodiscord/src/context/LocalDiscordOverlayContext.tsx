"use client";

import type { DMMessage } from "@/components/DMChatPanel";
import type { Channel, Message, MessageReaction, Server } from "@/types/discord";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export interface LocalDiscordOverlayContextValue {
  localServers: Server[];
  setLocalServers: Dispatch<SetStateAction<Server[]>>;
  localChannels: Channel[];
  setLocalChannels: Dispatch<SetStateAction<Channel[]>>;
  localMessages: Record<string, Message[]>;
  setLocalMessages: Dispatch<SetStateAction<Record<string, Message[]>>>;
  localReactions: Record<string, MessageReaction[]>;
  setLocalReactions: Dispatch<
    SetStateAction<Record<string, MessageReaction[]>>
  >;
  userReactions: Record<string, Set<string>>;
  setUserReactions: Dispatch<SetStateAction<Record<string, Set<string>>>>;
  dmMessages: Record<string, DMMessage[]>;
  setDmMessages: Dispatch<SetStateAction<Record<string, DMMessage[]>>>;
  voicePresence: Record<string, string[]>;
  setVoicePresence: Dispatch<SetStateAction<Record<string, string[]>>>;
  voiceChannelId: string | null;
  setVoiceChannelId: Dispatch<SetStateAction<string | null>>;
  voiceMuted: boolean;
  setVoiceMuted: Dispatch<SetStateAction<boolean>>;
}

const LocalDiscordOverlayContext =
  createContext<LocalDiscordOverlayContextValue | null>(null);

export function LocalDiscordOverlayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [localServers, setLocalServers] = useState<Server[]>([]);
  const [localChannels, setLocalChannels] = useState<Channel[]>([]);
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>(
    {},
  );
  const [localReactions, setLocalReactions] = useState<
    Record<string, MessageReaction[]>
  >({});
  const [userReactions, setUserReactions] = useState<
    Record<string, Set<string>>
  >({});
  const [dmMessages, setDmMessages] = useState<Record<string, DMMessage[]>>({});
  const [voicePresence, setVoicePresence] = useState<Record<string, string[]>>(
    {},
  );
  const [voiceChannelId, setVoiceChannelId] = useState<string | null>(null);
  const [voiceMuted, setVoiceMuted] = useState(false);

  const value = useMemo(
    () => ({
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
    }),
    [
      localServers,
      localChannels,
      localMessages,
      localReactions,
      userReactions,
      dmMessages,
      voicePresence,
      voiceChannelId,
      voiceMuted,
    ],
  );

  return (
    <LocalDiscordOverlayContext.Provider value={value}>
      {children}
    </LocalDiscordOverlayContext.Provider>
  );
}

export function useLocalDiscordOverlay() {
  const ctx = useContext(LocalDiscordOverlayContext);
  if (!ctx) {
    throw new Error(
      "useLocalDiscordOverlay must be used within LocalDiscordOverlayProvider",
    );
  }
  return ctx;
}
