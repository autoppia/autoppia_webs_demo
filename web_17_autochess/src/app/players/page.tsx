"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useSeed } from "@/context/SeedContext";
import { useEventLogger } from "@/hooks/useEventLogger";
import { DynamicWrapper } from "@/dynamic/v1/DynamicWrapper";
import { DynamicText } from "@/dynamic/v3/DynamicText";
import { generatePlayers } from "@/data/generators";
import { EVENT_TYPES } from "@/library/events";
import { getCountryFlag } from "@/library/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerCard } from "@/components/chess/PlayerCard";
import { COUNTRIES, PLAYER_TITLES } from "@/shared/constants";
import { Search, X, ArrowUpDown, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

type SortField = "rating" | "name" | "games" | "winrate";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 24;

export default function PlayersPage() {
  const { seed } = useSeed();
  const { logInteraction } = useEventLogger();
  const players = useMemo(() => generatePlayers(200, seed), [seed]);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [titleFilter, setTitleFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    if (value.length > 0) {
      logInteraction(EVENT_TYPES.SEARCH_PLAYER, { query: value, country: countryFilter, title: titleFilter });
    }
  }, [countryFilter, titleFilter, logInteraction]);

  const handleFilter = useCallback((type: string, value: string) => {
    if (type === "country") setCountryFilter(value);
    else if (type === "title") setTitleFilter(value);
    setPage(1);
  }, []);

  const hasActiveFilters = search || countryFilter !== "all" || titleFilter !== "all";

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setCountryFilter("all");
    setTitleFilter("all");
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    let result = players.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (countryFilter !== "all" && p.countryCode !== countryFilter) return false;
      if (titleFilter !== "all" && p.title !== titleFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "rating") cmp = a.rating - b.rating;
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "games") cmp = a.gamesPlayed - b.gamesPlayed;
      else if (sortField === "winrate") cmp = (a.wins / a.gamesPlayed) - (b.wins / b.gamesPlayed);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [players, search, countryFilter, titleFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getCountryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name || code;

  return (
    <div className="py-6">
      <DynamicWrapper>
        <h1 className="text-3xl font-bold text-white mb-6">
          <DynamicText value="Players" type="text" />
        </h1>
      </DynamicWrapper>

      {/* Search bar */}
      <DynamicWrapper>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by player name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </DynamicWrapper>

      {/* Filter bar */}
      <DynamicWrapper>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-zinc-500 hidden sm:block" />
            <Select value={countryFilter} onValueChange={(v) => handleFilter("country", v)}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white/10 border-white/20 text-zinc-300 h-10">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1917] border-stone-700/50">
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {getCountryFlag(c.code)} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={titleFilter} onValueChange={(v) => handleFilter("title", v)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-white/10 border-white/20 text-zinc-300 h-10">
                <SelectValue placeholder="Title" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1917] border-stone-700/50">
                <SelectItem value="all">All Titles</SelectItem>
                {PLAYER_TITLES.filter(t => t !== "").map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-zinc-500" />
            <select
              value={`${sortField}-${sortDir}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split("-") as [SortField, SortDir];
                setSortField(f);
                setSortDir(d);
                setPage(1);
              }}
              className="bg-white/10 border border-white/20 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="games-desc">Most Games</option>
              <option value="winrate-desc">Best Win Rate</option>
            </select>
          </div>
        </div>
      </DynamicWrapper>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <DynamicWrapper>
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <FilterPill label={`Search: "${search}"`} onRemove={() => { setSearch(""); setPage(1); }} />
            )}
            {countryFilter !== "all" && (
              <FilterPill
                label={`${getCountryFlag(countryFilter)} ${getCountryName(countryFilter)}`}
                onRemove={() => { setCountryFilter("all"); setPage(1); }}
              />
            )}
            {titleFilter !== "all" && (
              <FilterPill label={`Title: ${titleFilter}`} onRemove={() => { setTitleFilter("all"); setPage(1); }} />
            )}
          </div>
        </DynamicWrapper>
      )}

      {/* Results count */}
      <DynamicWrapper>
        <div className="text-sm text-zinc-300 mb-3">
          <span className="text-amber-400 font-semibold">{filtered.length}</span> player{filtered.length !== 1 ? "s" : ""} found
          {filtered.length > PAGE_SIZE && (
            <span className="text-zinc-500 ml-2">
              (showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)})
            </span>
          )}
        </div>
      </DynamicWrapper>

      {/* Results or Empty State */}
      <DynamicWrapper>
        {filtered.length === 0 ? (
          <div className="bg-[#1c1917] border border-stone-800/80 rounded-xl p-12 text-center">
            <Search className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">No players found</h3>
            <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">
              No players match your current filters. Try a different name or remove some filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paged.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`dots-${i}`} className="px-2 text-zinc-600">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                          currentPage === p
                            ? "bg-amber-600 text-white font-semibold"
                            : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </DynamicWrapper>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
