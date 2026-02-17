"use client";

import { Hash, Mic } from "lucide-react";
import type { Server, Channel } from "@/types/discord";

interface ChannelSidebarProps {
  server: Server | null;
  channels: Channel[];
  selectedChannelId: string | null;
  unreadChannelIds?: Set<string>;
  onSelectChannel: (id: string) => void;
}

export function ChannelSidebar({
  server,
  channels,
  selectedChannelId,
  unreadChannelIds = new Set(),
  onSelectChannel,
}: ChannelSidebarProps) {
  if (!server) return null;

  const sortedChannels = [...channels].sort((a, b) => a.position - b.position);

  return (
    <aside className="w-60 flex-shrink-0 bg-discord-sidebar flex flex-col overflow-hidden" aria-label="Channels">
      <div className="h-12 px-4 flex items-center border-b border-black/20 shadow">
        <span className="font-semibold text-white truncate">{server.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {sortedChannels.length === 0 ? (
          <p className="px-4 py-2 text-sm text-gray-500">No channels</p>
        ) : (
          sortedChannels.map((ch) => {
            const isSelected = selectedChannelId === ch.id;
            const isText = ch.type === "text";
            const hasUnread = isText && unreadChannelIds.has(ch.id) && !isSelected;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch.id)}
                className={`w-full px-4 py-1.5 flex items-center gap-2 text-left text-gray-300 hover:bg-white/5 hover:text-white ${
                  isSelected ? "bg-white/10 text-white" : ""
                } ${hasUnread ? "font-semibold" : ""}`}
                aria-pressed={isSelected}
              >
                {isText ? <Hash className="w-4 h-4 flex-shrink-0" /> : <Mic className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate flex-1">{ch.name}</span>
                {hasUnread && (
                  <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" aria-label="Unread" />
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
