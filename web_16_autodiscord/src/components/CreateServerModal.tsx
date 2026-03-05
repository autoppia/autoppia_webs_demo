"use client";

import { EVENT_TYPES, logEvent } from "@/library/events";
import { X } from "lucide-react";
import { useState } from "react";

interface CreateServerModalProps {
  open: boolean;
  onClose: () => void;
  onCreateServer: (name: string) => void;
}

export function CreateServerModal({
  open,
  onClose,
  onCreateServer,
}: CreateServerModalProps) {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serverName = name.trim() || "Unnamed";
    logEvent(EVENT_TYPES.CREATE_SERVER, { server_name: serverName });
    onCreateServer(serverName);
    setName("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      aria-modal="true"
      aria-labelledby="create-server-title"
      data-testid="create-server-modal"
    >
      <div className="w-full max-w-md rounded-xl bg-discord-sidebar shadow-xl border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-black/20">
          <h2
            id="create-server-title"
            className="text-lg font-semibold text-white"
          >
            Create Server
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close"
            data-testid="create-server-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <label className="block">
            <span className="block text-sm text-gray-400 mb-1">
              Server name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Server"
              className="w-full rounded-md bg-discord-input px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-discord-accent"
              maxLength={100}
              data-testid="create-server-name"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-300 hover:bg-white/10"
              data-testid="create-server-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90"
              data-testid="create-server-submit"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
