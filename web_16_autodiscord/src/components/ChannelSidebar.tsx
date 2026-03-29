"use client";

import { useDynamicSystem } from "@/dynamic";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Channel, Server } from "@/types/discord";
import { Hash, Mic, Plus, Settings } from "lucide-react";

interface ChannelSidebarProps {
  server: Server | null;
  channels: Channel[];
  selectedChannelId: string | null;
  unreadChannelIds?: Set<string>;
  onSelectChannel: (id: string) => void;
  onOpenServerSettings: () => void;
  onAddChannel?: () => void;
}

export function ChannelSidebar({
  server,
  channels,
  selectedChannelId,
  unreadChannelIds = new Set(),
  onSelectChannel,
  onOpenServerSettings,
  onAddChannel,
}: ChannelSidebarProps) {
  const dyn = useDynamicSystem();
  if (!server) return null;

  const sortedChannels = [...channels].sort((a, b) => a.position - b.position);
  const channelOrder = dyn.v1.changeOrderElements("channel-list", Math.max(sortedChannels.length, 1));

  const handleSelectChannel = (id: string) => {
    onSelectChannel(id);
    const ch = channels.find((c) => c.id === id);
    logEvent(EVENT_TYPES.SELECT_CHANNEL, {
      channel_id: id,
      channel_name: ch?.name ?? id,
      server_id: server.id,
      server_name: server.name,
    });
  };

  return (
    <aside
      className="w-60 flex-shrink-0 bg-discord-sidebar flex flex-col overflow-hidden"
      aria-label={dyn.v3.getVariant("nav_servers", undefined, "Channels")}
      data-testid={dyn.v3.getVariant("channel-sidebar", ID_VARIANTS_MAP, "channel-sidebar")}
    >
      <div className="h-12 px-4 flex items-center border-b border-black/20 shadow gap-1">
        <span className="font-semibold text-white truncate flex-1">
          {server.name}
        </span>
        <button
          type="button"
          onClick={() => {
            logEvent(EVENT_TYPES.OPEN_SERVER_SETTINGS, {
              server_id: server.id,
              server_name: server.name,
            });
            onOpenServerSettings();
          }}
          className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10"
          title="Server settings"
          aria-label="Server settings"
          data-testid={dyn.v3.getVariant("channel-sidebar-settings", ID_VARIANTS_MAP, "channel-sidebar-server-settings")}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
      {dyn.v1.addWrapDecoy("channel-list", (
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {sortedChannels.length === 0 ? (
            <p className="px-4 py-2 text-sm text-gray-500">
              {dyn.v3.getVariant("no_channels", undefined, "No channels")}
            </p>
          ) : (
            channelOrder.map((idx) => {
              const ch = sortedChannels[idx];
              if (!ch) return null;
              const isSelected = selectedChannelId === ch.id;
              const isText = ch.type === "text";
              const hasUnread =
                isText && unreadChannelIds.has(ch.id) && !isSelected;
              return dyn.v1.addWrapDecoy(`channel-item-${ch.id}`, (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSelectChannel(ch.id)}
                  className={`w-full px-4 py-1.5 flex items-center gap-2 text-left text-gray-300 hover:bg-white/5 hover:text-white ${
                    isSelected ? "bg-white/10 text-white" : ""
                  } ${hasUnread ? "font-semibold" : ""} ${dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "")}`}
                  aria-pressed={isSelected}
                  data-testid={dyn.v3.getVariant("channel-item", ID_VARIANTS_MAP, `channel-${ch.id}`)}
                >
                  {isText ? (
                    <Hash className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Mic className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate flex-1">{ch.name}</span>
                  {hasUnread && (
                    <span
                      className="w-2 h-2 rounded-full bg-white flex-shrink-0"
                      aria-label="Unread"
                    />
                  )}
                </button>
              ), ch.id);
            })
          )}
          {onAddChannel &&
            dyn.v1.addWrapDecoy("create-channel-button", (
              <button
                type="button"
                onClick={onAddChannel}
                className={`w-full px-4 py-1.5 mt-1 flex items-center gap-2 text-left text-gray-400 hover:bg-white/5 hover:text-white ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
                title={dyn.v3.getVariant("create_channel", undefined, "Create channel")}
                data-testid={dyn.v3.getVariant("create-channel-button", ID_VARIANTS_MAP, "channel-sidebar-add-channel")}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span>{dyn.v3.getVariant("create_channel", undefined, "Create channel")}</span>
              </button>
            ))}
        </div>
      ))}
    </aside>
  );
}
