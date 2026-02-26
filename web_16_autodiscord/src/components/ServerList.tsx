"use client";

import { Home, MessageCircle, Plus, Settings } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Server } from "@/types/discord";

interface ServerListProps {
  servers: Server[];
  selectedId: string | null;
  viewMode: "servers" | "dms";
  onSelect: (id: string) => void;
  onViewModeChange: (mode: "servers" | "dms") => void;
  onAddServer: () => void;
  onGoHome?: () => void;
}

export function ServerList({
  servers,
  selectedId,
  viewMode,
  onSelect,
  onViewModeChange,
  onAddServer,
  onGoHome,
}: ServerListProps) {
  const handleSelectServer = (id: string) => {
    onViewModeChange("servers");
    onSelect(id);
    const server = servers.find((s) => s.id === id);
    logEvent(EVENT_TYPES.SELECT_SERVER, { server_id: id, server_name: server?.name ?? id });
  };

  const handleHome = () => {
    onViewModeChange("servers");
    logEvent(EVENT_TYPES.VIEW_SERVERS, {});
    onGoHome?.();
  };

  const handleDMs = () => {
    onViewModeChange("dms");
    logEvent(EVENT_TYPES.VIEW_DMS, {});
  };

  const handleAddServer = () => {
    onAddServer();
  };

  return (
    <aside
      className="w-[72px] flex-shrink-0 bg-discord-darker flex flex-col items-center py-3 gap-2 scrollbar-thin overflow-y-auto"
      aria-label="Servers"
      data-testid="server-list"
    >
      <button
        type="button"
        onClick={handleHome}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          viewMode === "servers" && !selectedId ? "bg-discord-accent text-white rounded-xl" : viewMode === "servers" ? "bg-discord-dark text-gray-300 hover:bg-discord-accent hover:text-white rounded-xl" : "text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
        title="Home"
        aria-pressed={viewMode === "servers" && !selectedId}
        data-testid="server-list-home"
      >
        <Home className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={handleDMs}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          viewMode === "dms" ? "bg-discord-accent text-white rounded-xl" : "text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
        title="Direct Messages"
        aria-pressed={viewMode === "dms"}
        data-testid="server-list-dms"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      <div className="w-8 h-0.5 bg-white/20 rounded-full my-1" aria-hidden />
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
        {servers.map((s) => {
          const isSelected = viewMode === "servers" && selectedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectServer(s.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold transition-colors flex-shrink-0 ${
                isSelected
                  ? "bg-discord-accent text-white rounded-xl"
                  : "bg-discord-dark text-gray-300 hover:bg-discord-accent hover:text-white hover:rounded-xl"
              }`}
              title={s.name}
              aria-pressed={isSelected}
              data-testid={`server-${s.id}`}
            >
              {s.name.slice(0, 2).toUpperCase()}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleAddServer}
        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-discord-dark text-gray-400 hover:bg-green-600 hover:text-white transition-colors"
        title="Add Server"
        data-testid="server-list-add"
      >
        <Plus className="w-6 h-6" />
      </button>
      <a
        href="/settings"
        className="mt-auto w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        title="Settings"
        aria-label="Settings"
        data-testid="server-list-settings"
      >
        <Settings className="w-5 h-5" />
      </a>
    </aside>
  );
}
