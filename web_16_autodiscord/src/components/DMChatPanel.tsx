"use client";

import { useDynamicSystem } from "@/dynamic";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
import { EmptyState } from "@/components/EmptyState";
import { CURRENT_USER } from "@/constants/mock";
import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Member } from "@/types/discord";
import { formatMessageTime } from "@/utils/format";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DMMessage {
  id: string;
  fromUserId: string;
  content: string;
  timestamp: string;
}

interface DMChatPanelProps {
  peer: Member | null;
  messages: DMMessage[];
  onSendMessage: (content: string) => void;
}

export function DMChatPanel({
  peer,
  messages,
  onSendMessage,
}: DMChatPanelProps) {
  const dyn = useDynamicSystem();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !peer) return;
    logEvent(EVENT_TYPES.SEND_DM_MESSAGE, {
      peer_id: peer.id,
      name: peer.username,
      content: trimmed,
      content_length: trimmed.length,
    });
    onSendMessage(trimmed);
    setInput("");
  };

  useEffect(() => {
    if (peer) setInput("");
  }, [peer]);

  if (!peer) return null;

  const sorted = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const isEmpty = sorted.length === 0;

  return dyn.v1.addWrapDecoy("dm-chat-panel", (
    <section
      className="flex-1 flex flex-col bg-discord-channel min-w-0"
      aria-label="DM conversation"
      data-testid="dm-chat-panel"
    >
      {dyn.v1.addWrapDecoy("dm-chat-header", (
        <header className="h-12 px-4 flex items-center border-b border-black/20 gap-2">
          <div className="w-8 h-8 rounded-full bg-discord-darker flex items-center justify-center text-sm font-medium text-gray-300">
            {peer.displayName.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-white">{peer.displayName}</span>
        </header>
      ))}

      {dyn.v1.addWrapDecoy("dm-messages", (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {isEmpty ? (
            <EmptyState
              title="No messages yet"
              description="Send a message to start the conversation."
            />
          ) : (
            sorted.map((msg) => {
              const isCurrentUser = msg.fromUserId === "current";
              return (
                <div key={msg.id} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-full bg-discord-darker flex-shrink-0 flex items-center justify-center text-sm font-medium text-gray-300"
                    aria-hidden
                  >
                    {isCurrentUser
                      ? "YO"
                      : peer.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-white mr-2">
                      {isCurrentUser
                        ? CURRENT_USER.displayName
                        : peer.displayName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                    <p className="text-gray-300 break-words mt-0.5">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ))}

          {dyn.v1.addWrapDecoy("dm-message-form", (
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-black/20 flex gap-2"
        >
          {dyn.v1.addWrapDecoy("dm-input", (
            <input
              ref={inputRef}
              type="text"
              placeholder={dyn.v3.getVariant("dm_message_placeholder", undefined, `Message ${peer.displayName}`)}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              className={`flex-1 rounded-md bg-discord-input px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-discord-accent ${dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")}`}
              aria-label={`Message ${peer.displayName}`}
              data-testid={dyn.v3.getVariant("dm-message-input", ID_VARIANTS_MAP, "dm-message-input")}
            />
          ))}
          {dyn.v1.addWrapDecoy("dm-send-button", (
            <button
              type="submit"
              disabled={!input.trim()}
              className={`p-2.5 rounded-md bg-discord-accent text-white hover:bg-discord-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")}`}
              aria-label="Send message"
              data-testid={dyn.v3.getVariant("dm-send-button", ID_VARIANTS_MAP, "dm-send-button")}
            >
              <Send className="w-5 h-5" />
            </button>
          ))}
        </form>
      ))}
    </section>
  ));
}
