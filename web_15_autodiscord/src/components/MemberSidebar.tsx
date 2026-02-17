"use client";

import type { Member } from "@/types/discord";

interface MemberSidebarProps {
  members: Member[];
}

export function MemberSidebar({ members }: MemberSidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 bg-discord-sidebar flex flex-col overflow-hidden" aria-label="Members">
      <div className="h-12 px-4 flex items-center border-b border-black/20">
        <span className="text-sm font-medium text-gray-400">Members — {members.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {members.map((m) => (
          <div key={m.id} className="px-4 py-1.5 flex items-center gap-3 hover:bg-white/5">
            <div className="w-8 h-8 rounded-full bg-discord-dark flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={m.avatar}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-200 truncate">{m.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{m.username}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
