"use client";

import { EVENT_TYPES, logEvent } from "@/library/events";
import type { Member } from "@/types/discord";

interface DMSidebarProps {
  peers: Member[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

export function DMSidebar({
  peers,
  selectedUserId,
  onSelectUser,
}: DMSidebarProps) {
  const handleSelect = (userId: string) => {
    const peer = peers.find((p) => p.id === userId);
    logEvent(EVENT_TYPES.SELECT_DM, {
      user_id: userId,
      name: peer?.username ?? userId,
    });
    onSelectUser(userId);
  };

  return (
    <aside
      className="w-60 flex-shrink-0 bg-discord-sidebar flex flex-col overflow-hidden"
      aria-label="Direct messages"
      data-testid="dm-sidebar"
    >
      <div className="h-12 px-4 flex items-center border-b border-black/20 shadow">
        <span className="font-semibold text-white">Direct Messages</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {peers.length === 0 ? (
          <p className="px-4 py-2 text-sm text-gray-500">
            No conversations. (Demo: add friends from servers.)
          </p>
        ) : (
          peers.map((m) => {
            const isSelected = selectedUserId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelect(m.id)}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-left rounded-r-md ${
                  isSelected
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
                aria-pressed={isSelected}
                data-testid={`dm-peer-${m.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-discord-darker flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {m.displayName.slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate font-medium">{m.displayName}</span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
