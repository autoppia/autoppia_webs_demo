"use client";

import type { Server } from "@/types/discord";

interface ServerListProps {
  servers: Server[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ServerList({ servers, selectedId, onSelect }: ServerListProps) {
  if (servers.length === 0) return null;

  return (
    <aside
      className="w-[72px] flex-shrink-0 bg-discord-darker flex flex-col items-center py-3 gap-2 scrollbar-thin overflow-y-auto"
      aria-label="Servers"
    >
      {servers.map((s) => {
        const isSelected = selectedId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold transition-colors ${
              isSelected
                ? "bg-discord-accent text-white rounded-xl"
                : "bg-discord-dark text-gray-300 hover:bg-discord-accent hover:text-white hover:rounded-xl"
            }`}
            title={s.name}
            aria-pressed={isSelected}
          >
            {s.name.slice(0, 2).toUpperCase()}
          </button>
        );
      })}
    </aside>
  );
}
