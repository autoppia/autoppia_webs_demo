"use client";

import { CURRENT_USER } from "@/constants/mock";
import type { Channel, Member } from "@/types/discord";
import { Mic } from "lucide-react";

const STATUS_ORDER = ["online", "idle", "dnd", "offline"] as const;

function getStatusRank(s: string | undefined): number {
  const i = STATUS_ORDER.indexOf(s as (typeof STATUS_ORDER)[number]);
  return i >= 0 ? i : 4;
}

interface HomeDashboardProps {
  members: Member[];
  voiceChannels: Channel[];
  voicePresence: Record<string, string[]>;
  getServerName: (serverId: string) => string;
  /** When false, show a hint to use the sidebar + to create a server */
  hasServers?: boolean;
}

export function HomeDashboard({
  members,
  voiceChannels,
  voicePresence,
  getServerName,
  hasServers = true,
}: HomeDashboardProps) {
  const onlineMembers = [...members]
    .filter((m) => (m.status ?? "offline") !== "offline")
    .sort((a, b) => getStatusRank(a.status) - getStatusRank(b.status));

  const memberById = new Map(members.map((m) => [m.id, m]));
  memberById.set("current", {
    id: "current",
    serverId: "",
    username: CURRENT_USER.username,
    displayName: CURRENT_USER.displayName,
    avatar: "",
    role: "user",
    status: "online",
  });

  return (
    <main
      className="flex-1 flex flex-col bg-discord-channel min-w-0 overflow-hidden"
      aria-label="Home"
      data-testid="home-dashboard"
    >
      <div className="h-12 px-4 flex items-center border-b border-black/20">
        <span className="font-semibold text-white">Home</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {!hasServers && (
          <section
            className="rounded-lg bg-white/5 border border-white/10 p-4"
            aria-label="Getting started"
            data-testid="home-no-servers-hint"
          >
            <p className="text-sm text-gray-300">
              You don&apos;t have any servers yet. Use the green{" "}
              <span className="text-green-400 font-medium">+</span> button in
              the left bar (below Direct Messages) to{" "}
              <span className="text-gray-200">create a server</span>.
            </p>
          </section>
        )}
        <section aria-labelledby="online-heading">
          <h2
            id="online-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3"
          >
            Online — {onlineMembers.length + 1}
          </h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-white/5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-discord-accent/80 flex items-center justify-center text-white text-sm font-medium">
                  {CURRENT_USER.displayName.slice(0, 1)}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-discord-channel" />
              </div>
              <span className="text-gray-200">{CURRENT_USER.displayName}</span>
              <span className="text-xs text-gray-500">(you)</span>
            </li>
            {onlineMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-white/5"
                data-testid={`home-online-member-${m.id}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-discord-dark flex items-center justify-center text-sm text-gray-300">
                    {m.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-discord-channel ${
                      m.status === "online"
                        ? "bg-green-500"
                        : m.status === "idle"
                          ? "bg-yellow-500"
                          : m.status === "dnd"
                            ? "bg-red-500"
                            : "bg-gray-500"
                    }`}
                  />
                </div>
                <span className="text-gray-200">{m.displayName}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="voice-heading">
          <h2
            id="voice-heading"
            className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3"
          >
            In voice
          </h2>
          {voiceChannels.length === 0 ? (
            <p className="text-sm text-gray-500">No one in a voice channel.</p>
          ) : (
            <ul className="space-y-3">
              {voiceChannels.map((ch) => {
                const memberIds = voicePresence[ch.id] ?? [];
                const serverName = getServerName(ch.serverId);
                return (
                  <li
                    key={ch.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                    data-testid={`home-voice-channel-${ch.id}`}
                  >
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                      <Mic className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{ch.name}</span>
                      <span className="text-xs text-gray-500">
                        — {serverName}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {memberIds.map((uid) => {
                        const member = memberById.get(uid);
                        const name = member
                          ? member.displayName
                          : uid === "current"
                            ? CURRENT_USER.displayName
                            : "?";
                        return (
                          <span
                            key={uid}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-discord-darker text-sm text-gray-200"
                            data-testid={`home-voice-member-${ch.id}-${uid}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-discord-dark flex items-center justify-center text-xs">
                              {name.slice(0, 2).toUpperCase()}
                            </span>
                            {name}
                          </span>
                        );
                      })}
                      {memberIds.length === 0 && (
                        <span className="text-xs text-gray-500">Empty</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
