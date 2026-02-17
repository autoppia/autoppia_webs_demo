"use client";

import { Hash, Mic } from "lucide-react";
import type { Server, Channel } from "@/types/discord";

interface ChannelSidebarProps {
  server: Server | null;
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (id: string) => void;
}

export function ChannelSidebar({
  server,
  channels,
  selectedChannelId,
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
        {sortedChannels.map((ch) => {
          const isSelected = selectedChannelId === ch.id;
          const isText = ch.type === "text";
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChannel(ch.id)}
              className={`w-full px-4 py-1.5 flex items-center gap-2 text-left text-gray-300 hover:bg-white/5 hover:text-white ${
                isSelected ? "bg-white/10 text-white" : ""
              }`}
              aria-pressed={isSelected}
            >
              {isText ? <Hash className="w-4 h-4 flex-shrink-0" /> : <Mic className="w-4 h-4 flex-shrink-0" />}
              <span className="truncate">{ch.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
