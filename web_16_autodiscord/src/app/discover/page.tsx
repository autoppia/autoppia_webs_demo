"use client";

import { CreateServerModal } from "@/components/CreateServerModal";
import { ServerList } from "@/components/ServerList";
import { useLocalDiscordOverlay } from "@/context/LocalDiscordOverlayContext";
import {
  DISCOVER_CATEGORIES,
  type DiscoverCategoryId,
  filterDiscoverServers,
  type DiscoverableServer,
} from "@/data/discover-mock";
import { useDynamicSystem } from "@/dynamic";
import { getDiscordData } from "@/dynamic/v2";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP } from "@/dynamic/v3";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { Compass, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function ServerCard({
  server,
  joined,
  onJoin,
  testIdPrefix,
}: {
  server: DiscoverableServer;
  joined: boolean;
  onJoin: (s: DiscoverableServer) => void;
  testIdPrefix: string;
}) {
  const dyn = useDynamicSystem();
  const [from, to] = server.gradient;
  return (
    <article
      className="group rounded-xl overflow-hidden bg-discord-sidebar border border-black/20 shadow-lg flex flex-col min-h-[280px] max-w-md mx-auto w-full"
      data-testid={dyn.v3.getVariant("discover-card", ID_VARIANTS_MAP, `${testIdPrefix}-${server.id}`)}
    >
      <div
        className="h-28 relative shrink-0"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        <div className="absolute left-4 -bottom-7 w-14 h-14 rounded-2xl bg-discord-darker border-4 border-discord-sidebar flex items-center justify-center text-lg font-bold text-white shadow-md">
          {server.name.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="pt-10 px-4 pb-4 flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-white leading-tight">
          {server.name}
        </h2>
        <p className="text-sm text-gray-400 mt-2 line-clamp-3 flex-1">
          {server.description}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
          <span className="text-green-400/90">{server.onlineLabel}</span>
          <span>{server.memberLabel}</span>
        </div>
        <button
          type="button"
          disabled={joined}
          onClick={() => onJoin(server)}
          className={`mt-4 w-full py-2 rounded-md text-sm font-medium transition-colors ${dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")} ${
            joined
              ? "bg-white/10 text-gray-400 cursor-default"
              : "bg-discord-accent text-white hover:bg-discord-accent/90"
          }`}
          data-testid={dyn.v3.getVariant("discover-join", ID_VARIANTS_MAP, `discover-join-${server.id}`)}
        >
          {joined ? "Joined" : "Join"}
        </button>
      </div>
    </article>
  );
}

export default function DiscoverPage() {
  const dyn = useDynamicSystem();
  const router = useSeedRouter();
  const { localServers, setLocalServers } = useLocalDiscordOverlay();
  const data = getDiscordData();
  const allServers = useMemo(() => [...(data?.servers ?? []), ...localServers], [data?.servers, localServers]);
  const allServerIds = useMemo(() => new Set(allServers.map((s) => s.id)), [allServers]);

  const [category, setCategory] = useState<DiscoverCategoryId>("all");
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [createServerModalOpen, setCreateServerModalOpen] = useState(false);

  useEffect(() => logEvent(EVENT_TYPES.VIEW_DISCOVER, {}), []);

  const goMainApp = useCallback((path: string) => router.push(path), [router]);
  const handleSelectServer = useCallback(
    (id: string) => router.push(`/?server=${encodeURIComponent(id)}`),
    [router],
  );

  const handleCreateServer = useCallback((name: string) => {
    const id = `local-server-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setLocalServers((prev) => [...prev, { id, name, icon: null }]);
    router.push(`/?server=${encodeURIComponent(id)}`);
  }, [setLocalServers, router]);

  const visible = useMemo(() => filterDiscoverServers(category, appliedQuery), [category, appliedQuery]);

  const handleCategory = useCallback((id: DiscoverCategoryId) => {
    setCategory(id);
    logEvent(EVENT_TYPES.DISCOVER_SELECT_CATEGORY, { category_id: id });
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    setAppliedQuery(q);
    logEvent(EVENT_TYPES.DISCOVER_SEARCH, { query: q, query_length: q.length });
  }, [searchInput]);

  const handleJoin = useCallback((server: DiscoverableServer) => {
    logEvent(EVENT_TYPES.DISCOVER_JOIN_SERVER, {
      server_id: server.id, server_name: server.name, category: server.category,
    });
    setJoinedIds((prev) => new Set(prev).add(server.id));
    setLocalServers((prev) =>
      prev.some((s) => s.id === server.id) ? prev : [...prev, { id: server.id, name: server.name, icon: null }],
    );
  }, [setLocalServers]);

  return (
    <div className="h-screen bg-discord-darkest flex overflow-hidden">
      <ServerList
        servers={allServers}
        selectedId={null}
        viewMode="servers"
        discoverNavActive
        onSelect={handleSelectServer}
        onViewModeChange={(mode) => {
          if (mode === "dms") goMainApp("/?view=dms");
        }}
        onAddServer={() => setCreateServerModalOpen(true)}
        onGoHome={() => goMainApp("/")}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <header className="shrink-0 border-b border-black/20 bg-discord-darker/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-6 h-6 text-discord-accent shrink-0" />
            <h1 className="text-lg font-semibold text-white truncate">
              Discover
            </h1>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <p className="text-gray-400 text-sm mb-3">
            Find your community on Discord — browse featured spaces (demo data).
          </p>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Explore communities"
              className={`w-full rounded-lg bg-discord-input pl-10 pr-4 py-2.5 text-gray-200 placeholder-gray-500 border border-black/20 focus:outline-none focus:ring-2 focus:ring-discord-accent/50 ${dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")}`}
              aria-label="Search communities"
              data-testid={dyn.v3.getVariant("discover-search-input", ID_VARIANTS_MAP, "discover-search-input")}
            />
          </form>
        </div>
      </header>

      <div className="border-b border-black/20 bg-discord-darkest sticky top-0 z-[5]">
        <div className="max-w-6xl mx-auto px-4 py-2 overflow-x-auto scrollbar-thin">
          <div className="flex gap-2 min-w-max pb-1">
            {DISCOVER_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  category === c.id ? "bg-white text-discord-darkest" : "bg-discord-sidebar text-gray-300 hover:bg-white/10 hover:text-white"
                } ${dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "")}`}
                aria-pressed={category === c.id}
                data-testid={dyn.v3.getVariant("discover-category", ID_VARIANTS_MAP, `discover-cat-${c.id}`)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {visible.length === 0 ? (
          <div
            className="text-center py-16 text-gray-500"
            data-testid={dyn.v3.getVariant("discover-empty", ID_VARIANTS_MAP, "discover-empty")}
          >
            <p className="text-lg font-medium text-gray-400">
              No communities match your search
            </p>
            <p className="text-sm mt-2">
              Try another keyword or pick a different category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                joined={joinedIds.has(server.id) || allServerIds.has(server.id)}
                onJoin={handleJoin}
                testIdPrefix="discover-card"
              />
            ))}
          </div>
        )}
      </main>
      </div>
      <CreateServerModal
        open={createServerModalOpen}
        onClose={() => setCreateServerModalOpen(false)}
        onCreateServer={handleCreateServer}
      />
    </div>
  );
}
