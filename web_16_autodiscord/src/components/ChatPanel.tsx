"use client";

import { useState, useRef, useEffect } from "react";
import { Hash, ThumbsUp } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { formatMessageTime, formatMessageDateGroup } from "@/utils/format";
import { EmptyState } from "@/components/EmptyState";
import { CURRENT_USER } from "@/constants/mock";
import { useSeed } from "@/context/SeedContext";
import type { Channel, Message, MessageReaction } from "@/types/discord";

interface ChatPanelProps {
  channel: Channel | null;
  messages: Message[];
  localReactions: Record<string, MessageReaction[]>;
  onSendMessage: (content: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

function groupMessagesByDate(messages: Message[]): { dateLabel: string; messages: Message[] }[] {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const groups: { dateLabel: string; messages: Message[] }[] = [];
  let currentLabel = "";
  let currentGroup: Message[] = [];

  for (const msg of sorted) {
    const label = formatMessageDateGroup(msg.timestamp);
    if (label !== currentLabel) {
      if (currentGroup.length > 0) {
        groups.push({ dateLabel: currentLabel, messages: currentGroup });
      }
      currentLabel = label;
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  }
  if (currentGroup.length > 0) {
    groups.push({ dateLabel: currentLabel, messages: currentGroup });
  }
  return groups;
}

function mergeReactions(
  message: Message,
  local: MessageReaction[] | undefined
): MessageReaction[] {
  const base = message.reactions ?? [];
  if (!local || local.length === 0) return base;
  const byEmoji = new Map<string, number>();
  for (const r of base) byEmoji.set(r.emoji, (byEmoji.get(r.emoji) ?? 0) + r.count);
  for (const r of local) byEmoji.set(r.emoji, (byEmoji.get(r.emoji) ?? 0) + r.count);
  return Array.from(byEmoji.entries()).map(([emoji, count]) => ({ emoji, count }));
}

export function ChatPanel({
  channel,
  messages,
  localReactions,
  onSendMessage,
  onReaction,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { seed } = useSeed();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !channel) return;
    logEvent(EVENT_TYPES.SEND_MESSAGE, { channel_id: channel.id, content_length: trimmed.length });
    onSendMessage(trimmed);
    setInput("");
  };

  useEffect(() => {
    if (channel) setInput("");
  }, [channel]);

  if (!channel) return null;

  const groups = groupMessagesByDate(messages);
  const isEmpty = messages.length === 0;

  return (
    <section className="flex-1 flex flex-col bg-discord-channel min-w-0" aria-label="Chat">
      <header className="h-12 px-4 flex items-center border-b border-black/20 gap-2">
        <Hash className="w-5 h-5 text-gray-400" aria-hidden />
        <span className="font-semibold text-white">{channel.name}</span>
        <span className="ml-auto text-xs text-gray-500" title="Dataset seed">Seed: {seed}</span>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-6">
        {isEmpty ? (
          <EmptyState
            title="No messages yet"
            description="Send a message below to start the conversation."
          />
        ) : (
          groups.map(({ dateLabel, messages: groupMessages }) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-4 py-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {dateLabel}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="space-y-4 mt-2">
                {groupMessages.map((msg) => {
                  const reactions = mergeReactions(msg, localReactions[msg.id]);
                  const isCurrentUser = msg.authorUsername === CURRENT_USER.username;
                  return (
                    <div key={msg.id} className="flex gap-4 group">
                      <div
                        className="w-10 h-10 rounded-full bg-discord-darker flex-shrink-0 flex items-center justify-center text-sm font-medium text-gray-300"
                        aria-hidden
                      >
                        {String(msg.authorUsername).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-white mr-2">
                          {isCurrentUser ? CURRENT_USER.displayName : msg.authorUsername}
                        </span>
                        <span className="text-xs text-gray-500">{formatMessageTime(msg.timestamp)}</span>
                        <p className="text-gray-300 break-words mt-0.5">{msg.content}</p>
                        {reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {reactions.map((r) => (
                              <button
                                key={r.emoji}
                                type="button"
                                onClick={() => {
                                logEvent(EVENT_TYPES.ADD_REACTION, { message_id: msg.id, emoji: r.emoji });
                                onReaction(msg.id, r.emoji);
                              }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-gray-300 text-sm"
                              >
                                {r.emoji === "👍" ? <ThumbsUp className="w-3.5 h-3.5" /> : r.emoji}
                                <span>{r.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {reactions.length === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                                logEvent(EVENT_TYPES.ADD_REACTION, { message_id: msg.id, emoji: "👍" });
                                onReaction(msg.id, "👍");
                              }}
                            className="mt-1 opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-gray-400 text-sm transition-opacity"
                            aria-label="Add reaction"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-black/20">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Message #${channel.name}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          className="w-full rounded-md bg-discord-input px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-discord-accent"
          aria-label={`Message ${channel.name}`}
        />
      </form>
    </section>
  );
}
