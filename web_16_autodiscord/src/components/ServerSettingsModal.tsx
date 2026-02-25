"use client";

import { Trash2, X } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Server } from "@/types/discord";

interface ServerSettingsModalProps {
  server: Server | null;
  open: boolean;
  onClose: () => void;
  onDeleteServer?: (serverId: string) => void;
}

export function ServerSettingsModal({ server, open, onClose, onDeleteServer }: ServerSettingsModalProps) {
  if (!open || !server) return null;

  const isLocalServer = server.id.startsWith("local-server-");

  const handleDelete = () => {
    if (!isLocalServer || !onDeleteServer) return;
    logEvent(EVENT_TYPES.DELETE_SERVER, { server_id: server.id, server_name: server.name });
    onDeleteServer(server.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" aria-modal="true" aria-labelledby="server-settings-title" data-testid="server-settings-modal">
      <div className="w-full max-w-md rounded-xl bg-discord-sidebar shadow-xl border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-black/20">
          <h2 id="server-settings-title" className="text-lg font-semibold text-white">Server Settings — {server.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close"
            data-testid="server-settings-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-gray-400 text-sm">
            Overview, roles, and moderation options appear here. (Demo: settings are mocked.)
          </p>
          {isLocalServer && onDeleteServer && (
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300"
                data-testid="server-settings-delete"
              >
                <Trash2 className="w-4 h-4" />
                Delete server
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
