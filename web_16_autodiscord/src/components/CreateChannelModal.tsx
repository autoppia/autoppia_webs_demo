"use client";

import { useDynamicSystem } from "@/dynamic";
import { CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Channel } from "@/types/discord";
import { X } from "lucide-react";
import { useState } from "react";

interface CreateChannelModalProps {
  open: boolean;
  serverId: string | null;
  serverName: string;
  onClose: () => void;
  onCreateChannel: (name: string, type: "text" | "voice") => void;
}

export function CreateChannelModal({
  open,
  serverId,
  serverName,
  onClose,
  onCreateChannel,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [channelType, setChannelType] = useState<"text" | "voice">("text");
  const dyn = useDynamicSystem();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed =
      name.trim() || (channelType === "text" ? "new-channel" : "Voice");
    logEvent(EVENT_TYPES.CREATE_CHANNEL, {
      server_id: serverId,
      server_name: serverName,
      channel_name: trimmed,
      channel_type: channelType,
    });
    onCreateChannel(trimmed, channelType);
    setName("");
    setChannelType("text");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      aria-modal="true"
      aria-labelledby="create-channel-title"
      data-testid="create-channel-modal"
    >
      <div className="w-full max-w-md rounded-xl bg-discord-sidebar shadow-xl border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-black/20">
          <h2
            id="create-channel-title"
            className="text-lg font-semibold text-white"
          >
            {dyn.v3.getVariant("create_channel_modal_title", undefined, `Create channel — ${serverName}`)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close"
            data-testid="create-channel-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <label className="block">
            <span className="block text-sm text-gray-400 mb-1">
              {dyn.v3.getVariant("create_channel_name_label", undefined, "Channel name")}
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                channelType === "text"
                  ? dyn.v3.getVariant("create_channel_name_placeholder_text", undefined, "general")
                  : dyn.v3.getVariant("create_channel_name_placeholder_voice", undefined, "Voice")
              }
              className={`w-full rounded-md bg-discord-input px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-discord-accent ${dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")}`}
              maxLength={100}
              data-testid="create-channel-name"
            />
          </label>
          <div>
            <span className="block text-sm text-gray-400 mb-2">
              {dyn.v3.getVariant("create_channel_type_label", undefined, "Type")}
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="channelType"
                  value="text"
                  checked={channelType === "text"}
                  onChange={() => setChannelType("text")}
                  className={`rounded border-gray-500 text-discord-accent focus:ring-discord-accent ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
                  data-testid="create-channel-type-text"
                />
                <span className="text-gray-200">
                  {dyn.v3.getVariant("create_channel_type_text_label", undefined, "Text")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="channelType"
                  value="voice"
                  checked={channelType === "voice"}
                  onChange={() => setChannelType("voice")}
                  className={`rounded border-gray-500 text-discord-accent focus:ring-discord-accent ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
                  data-testid="create-channel-type-voice"
                />
                <span className="text-gray-200">
                  {dyn.v3.getVariant("create_channel_type_voice_label", undefined, "Voice")}
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-gray-300 hover:bg-white/10 ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
              data-testid="create-channel-cancel"
            >
              {dyn.v3.getVariant("create_channel_cancel", undefined, "Cancel")}
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90 ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
              data-testid="create-channel-submit"
            >
              {dyn.v3.getVariant("create_channel_submit", undefined, "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
