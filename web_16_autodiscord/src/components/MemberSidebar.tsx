"use client";

import type { Member, MemberStatus } from "@/types/discord";
import { CURRENT_USER } from "@/constants/mock";

const STATUS_COLORS: Record<MemberStatus, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-500",
};

function getMockStatus(index: number): MemberStatus {
  const statuses: MemberStatus[] = ["online", "idle", "dnd", "offline"];
  return statuses[index % statuses.length];
}

interface MemberSidebarProps {
  members: Member[];
}

export function MemberSidebar({ members }: MemberSidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 bg-discord-sidebar flex flex-col overflow-hidden" aria-label="Members">
      <div className="h-12 px-4 flex items-center border-b border-black/20">
        <span className="text-sm font-medium text-gray-400">Members — {members.length + 1}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        <div className="px-4 py-1.5 flex items-center gap-3 hover:bg-white/5">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-discord-accent/80 flex items-center justify-center text-white text-sm font-medium">
              {CURRENT_USER.displayName.slice(0, 1)}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-discord-sidebar ${STATUS_COLORS.online}`}
              aria-label="Online"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-200 truncate">{CURRENT_USER.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{CURRENT_USER.username}</p>
          </div>
        </div>
        {members.map((m, i) => {
          const status = m.status ?? getMockStatus(i);
          return (
            <div key={m.id} className="px-4 py-1.5 flex items-center gap-3 hover:bg-white/5">
              <div className="relative flex-shrink-0">
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
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-discord-sidebar ${STATUS_COLORS[status]}`}
                  aria-label={status}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-200 truncate">{m.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{m.username}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
