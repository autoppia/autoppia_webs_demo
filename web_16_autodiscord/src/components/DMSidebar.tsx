"use client";

import { useDynamicSystem } from "@/dynamic";
import { CLASS_VARIANTS_MAP, ID_VARIANTS_MAP } from "@/dynamic/v3";
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
  const dyn = useDynamicSystem();

  const handleSelect = (userId: string) => {
    const peer = peers.find((p) => p.id === userId);
    logEvent(EVENT_TYPES.SELECT_DM, {
      user_id: userId,
      name: peer?.username ?? userId,
    });
    onSelectUser(userId);
  };

  return (
    <div className="w-60 flex-shrink-0 flex flex-col min-h-0">
      {dyn.v1.addWrapDecoy("dm-sidebar", (
        <aside
          className="flex-1 min-h-0 w-60 bg-discord-sidebar flex flex-col overflow-hidden"
          aria-label="Direct messages"
          data-testid={dyn.v3.getVariant("dm-sidebar", ID_VARIANTS_MAP, "dm-sidebar")}
        >
      {dyn.v1.addWrapDecoy("dm-header", (
        <div className="h-12 px-4 flex items-center border-b border-black/20 shadow">
          <span className="font-semibold text-white">Direct Messages</span>
        </div>
      ))}
      {dyn.v1.addWrapDecoy("dm-list", (
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {peers.length === 0 ? (
            <p className="px-4 py-2 text-sm text-gray-500">
              No conversations. (Demo: add friends from servers.)
            </p>
          ) : (
            peers.map((m) => {
              const isSelected = selectedUserId === m.id;
              return dyn.v1.addWrapDecoy(`dm-peer-${m.id}`, (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m.id)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-left rounded-r-md ${
                    isSelected
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  } ${dyn.v3.getVariant("nav-link", CLASS_VARIANTS_MAP, "")}`}
                  aria-pressed={isSelected}
                  data-testid={dyn.v3.getVariant("dm-peer", ID_VARIANTS_MAP, `dm-peer-${m.id}`)}
                >
                  <div className="w-8 h-8 rounded-full bg-discord-darker flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {m.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate font-medium">{m.displayName}</span>
                </button>
              ), m.id);
            })
          )}
        </div>
      ))}
        </aside>
      ))}
    </div>
  );
}
