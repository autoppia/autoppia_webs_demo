"use client";

import { useDynamicSystem } from "@/dynamic";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Server } from "@/types/discord";
import { Home, MessageCircle, Plus, Settings } from "lucide-react";

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
  const dyn = useDynamicSystem();
  const order = dyn.v1.changeOrderElements("server-list-items", Math.max(servers.length, 1));

  const handleSelectServer = (id: string) => {
    onViewModeChange("servers");
    onSelect(id);
    const server = servers.find((s) => s.id === id);
    logEvent(EVENT_TYPES.SELECT_SERVER, {
      server_id: id,
      server_name: server?.name ?? id,
    });
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
      aria-label={dyn.v3.getVariant("nav_servers", undefined, "Servers")}
      data-testid={dyn.v3.getVariant("server-list", ID_VARIANTS_MAP, "server-list")}
    >
      {dyn.v1.addWrapDecoy("server-list-home-wrap", (
        <button
          type="button"
          onClick={handleHome}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            viewMode === "servers" && !selectedId
              ? "bg-discord-accent text-white rounded-xl"
              : viewMode === "servers"
                ? "bg-discord-dark text-gray-300 hover:bg-discord-accent hover:text-white rounded-xl"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
          } ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
          title={dyn.v3.getVariant("go_home", undefined, "Home")}
          aria-pressed={viewMode === "servers" && !selectedId}
          data-testid={dyn.v3.getVariant("server-list-home", ID_VARIANTS_MAP, "server-list-home")}
        >
          <Home className="w-6 h-6" />
        </button>
      ))}
      {dyn.v1.addWrapDecoy("server-list-dms-wrap", (
        <button
          type="button"
          onClick={handleDMs}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            viewMode === "dms"
              ? "bg-discord-accent text-white rounded-xl"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          } ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
          title={dyn.v3.getVariant("nav_dms", undefined, "Direct Messages")}
          aria-pressed={viewMode === "dms"}
          data-testid={dyn.v3.getVariant("server-list-dms", ID_VARIANTS_MAP, "server-list-dms")}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ))}
      <div className="w-8 h-0.5 bg-white/20 rounded-full my-1" aria-hidden />
      {dyn.v1.addWrapDecoy("server-list", (
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
          {order.map((idx) => {
            const s = servers[idx];
            if (!s) return null;
            const isSelected = viewMode === "servers" && selectedId === s.id;
            return dyn.v1.addWrapDecoy(`server-item-${s.id}`, (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectServer(s.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold transition-colors flex-shrink-0 ${
                  isSelected
                    ? "bg-discord-accent text-white rounded-xl"
                    : "bg-discord-dark text-gray-300 hover:bg-discord-accent hover:text-white hover:rounded-xl"
                } ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
                title={s.name}
                aria-pressed={isSelected}
                data-testid={dyn.v3.getVariant("server-item", ID_VARIANTS_MAP, `server-${s.id}`)}
              >
                {s.name.slice(0, 2).toUpperCase()}
              </button>
            ), s.id);
          })}
        </div>
      ))}
      {dyn.v1.addWrapDecoy("create-server-button", (
        <button
          type="button"
          onClick={handleAddServer}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-discord-dark text-gray-400 hover:bg-green-600 hover:text-white transition-colors ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
          title={dyn.v3.getVariant("create_server", undefined, "Add Server")}
          data-testid={dyn.v3.getVariant("create-server-button", ID_VARIANTS_MAP, "server-list-add")}
        >
          <Plus className="w-6 h-6" />
        </button>
      ))}
      {dyn.v1.addWrapDecoy("server-settings-button", (
        <a
          href={`/settings${typeof window !== "undefined" && window.location.search ? window.location.search : ""}`}
          className={`mt-auto w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
          title={dyn.v3.getVariant("settings_button_label", undefined, "Settings")}
          aria-label={dyn.v3.getVariant("settings_button_label", undefined, "Settings")}
          data-testid={dyn.v3.getVariant("server-list-settings", ID_VARIANTS_MAP, "server-list-settings")}
        >
          <Settings className="w-5 h-5" />
        </a>
      ))}
    </aside>
  );
}
