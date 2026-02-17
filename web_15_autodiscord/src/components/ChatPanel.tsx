"use client";

import { Hash } from "lucide-react";
import { formatMessageTime } from "@/utils/format";
import type { Channel, Message } from "@/types/discord";

interface ChatPanelProps {
  channel: Channel | null;
  messages: Message[];
}

export function ChatPanel({ channel, messages }: ChatPanelProps) {
  if (!channel) return null;

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <section className="flex-1 flex flex-col bg-discord-channel min-w-0" aria-label="Chat">
      <header className="h-12 px-4 flex items-center border-b border-black/20 gap-2">
        <Hash className="w-5 h-5 text-gray-400" aria-hidden />
        <span className="font-semibold text-white">{channel.name}</span>
      </header>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-4">
        {sortedMessages.map((msg) => (
          <div key={msg.id} className="flex gap-4 group">
            <div
              className="w-10 h-10 rounded-full bg-discord-darker flex-shrink-0 flex items-center justify-center text-sm font-medium text-gray-300"
              aria-hidden
            >
              {String(msg.authorUsername).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium text-white mr-2">{msg.authorUsername}</span>
              <span className="text-xs text-gray-500">{formatMessageTime(msg.timestamp)}</span>
              <p className="text-gray-300 break-words mt-0.5">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-black/20">
        <input
          type="text"
          placeholder={`Message #${channel.name}`}
          className="w-full rounded-md bg-discord-input px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-discord-accent"
          readOnly
          disabled
          aria-label={`Message ${channel.name}`}
        />
      </div>
    </section>
  );
}
